import { HttpError } from '../../http';
import type { SitePage } from '../types';
import { pageSchema } from '../validation';
import { editorMode, marketingDatasetConfigured, marketingWriteToken, unavailable } from './config';
import { localSave, localStates } from './local';
import { sanityPublished, sanitySave, sanityStates } from './sanity';

export function siteEditorWritable() {
  const mode = editorMode();
  return (
    mode === 'local' ||
    (mode === 'sanity' && marketingDatasetConfigured() && Boolean(marketingWriteToken()))
  );
}

export async function editorStates(path?: string) {
  const mode = editorMode();
  if (mode === 'local') return localStates(path);
  if (mode === 'sanity' && marketingDatasetConfigured()) {
    if (siteEditorWritable()) return sanityStates(path);
    return (await sanityPublished(path)).map((published) => ({
      path: published.path,
      published,
      draft: null,
      revision: null,
    }));
  }
  return [];
}

export async function persist(page: SitePage, revision: string | null, publish: boolean) {
  if (!siteEditorWritable()) throw unavailable();
  return editorMode() === 'local'
    ? localSave(page, revision, publish)
    : sanitySave(page, revision, publish);
}

export async function seedPublishedPages(pages: SitePage[]) {
  if (!siteEditorWritable()) throw unavailable();
  let inserted = 0;
  for (const input of pages) {
    const page = pageSchema.parse(input);
    if ((await editorStates(page.path)).length) continue;
    try {
      await persist(page, null, true);
      inserted++;
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 409)) throw error;
    }
  }
  return { total: pages.length, inserted, preserved: pages.length - inserted };
}
