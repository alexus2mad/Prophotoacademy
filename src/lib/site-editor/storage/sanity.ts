import { createHash } from 'node:crypto';
import { conflict, marketingClient, marketingDatasetConfigured } from './config';
import type { PageState, PublicDocument } from './types';
import type { SitePage } from '../types';

const publishedType = 'academySitePage';
const workType = 'academySitePageWorkspace';
const uncached = { cache: 'no-store' } as const;

function ids(path: string) {
  const hash = createHash('sha256').update(path).digest('hex');
  // Root-level documents are public. Sanity restricts drafts.* to authenticated readers.
  return { published: 'site-page-' + hash, working: 'drafts.site-page-work-' + hash };
}

function state(path: string, published?: PublicDocument, working?: PublicDocument): PageState {
  return {
    path,
    published: published?.page ?? null,
    draft: working?.page ?? null,
    revision:
      published || working ? [published?._rev || '-', working?._rev || '-'].join(':') : null,
  };
}

async function editorRecords(path?: string) {
  const filter = path ? ' && path == $path' : '';
  return marketingClient(true).fetch<PublicDocument[]>(
    `*[_type in $types${filter}]{_id,_rev,_type,path,page}`,
    { types: [publishedType, workType], path: path || '' },
    uncached,
  );
}

export async function sanityStates(path?: string) {
  const records = await editorRecords(path);
  const docs = new Map(records.map((r) => [r._id, r]));
  return Array.from(new Set(records.map((r) => r.path)), (pagePath) => {
    const id = ids(pagePath);
    return state(pagePath, docs.get(id.published), docs.get(id.working));
  });
}

export async function sanityPublished(path?: string) {
  if (!marketingDatasetConfigured()) return [];
  const filter = path ? ' && _id == $id' : '';
  return marketingClient().fetch<SitePage[]>(
    `*[_type == $type && !(_id in path("drafts.**"))${filter}] | order(path asc).page`,
    { type: publishedType, id: path ? ids(path).published : '' },
    uncached,
  );
}

// Sanity arrays need stable keys. Public API and render values keep the compact page shape.
function governedContent(page: SitePage) {
  const assets = new Set<string>();
  const prefix =
    'https://cdn.sanity.io/images/' +
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID +
    '/' +
    process.env.NEXT_PUBLIC_SANITY_DATASET +
    '/';
  for (const section of page.sections) {
    for (const field of section.fields) {
      if (field.kind !== 'image' || !field.value.startsWith(prefix)) continue;
      const file = field.value.slice(prefix.length).split('?')[0];
      if (/^[a-f0-9]+-\d+x\d+\.[a-z0-9]+$/.test(file))
        assets.add('image-' + file.replace('.', '-'));
    }
  }
  return {
    // Actual references let Sanity protect photographs still used by a draft or a live page.
    images: Array.from(assets, (asset) => ({ _key: asset, _type: 'reference', _ref: asset })),
    page: {
      ...page,
      sections: page.sections.map((section) => ({
        ...section,
        _key: section.id,
        _type: 'object',
        fields: section.fields.map((field) => ({ ...field, _key: field.id, _type: 'object' })),
      })),
    },
  };
}

export async function sanitySave(page: SitePage, revision: string | null, publish: boolean) {
  const client = marketingClient(true);
  const id = ids(page.path);
  const records = await editorRecords(page.path);
  const oldPublic = records.find((r) => r._id === id.published);
  const oldWorking = records.find((r) => r._id === id.working);
  if (state(page.path, oldPublic, oldWorking).revision !== revision) throw conflict();
  const transaction = client.transaction();
  const content = governedContent(page);
  const working = {
    path: page.path,
    page: publish ? null : content.page,
    images: publish ? [] : content.images,
  };
  // Keep a private revision even after publish so simultaneous first writes and draft recreation serialize.
  if (oldWorking)
    transaction.patch(id.working, (p) => p.ifRevisionId(oldWorking._rev).set(working));
  else transaction.create({ ...working, _id: id.working, _type: workType });
  if (publish) {
    const publication = { path: page.path, ...content };
    if (oldPublic)
      transaction.patch(id.published, (p) => p.ifRevisionId(oldPublic._rev).set(publication));
    else transaction.create({ ...publication, _id: id.published, _type: publishedType });
  }
  try {
    const changed = await transaction.commit<PublicDocument>({
      returnDocuments: true,
      returnFirst: false,
      visibility: 'sync',
    });
    return state(
      page.path,
      changed.find((r) => r._id === id.published) ?? oldPublic,
      changed.find((r) => r._id === id.working),
    );
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 409)
      throw conflict();
    throw error;
  }
}
