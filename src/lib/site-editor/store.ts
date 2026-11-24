import { HttpError } from '../http';
import { findWorkshopOffer } from '../commerce/workshop-offers';
import { getSiteSeeds, newSitePage } from './seeds';
import { applyPageTemplate, templateShell } from './templates';
import { isStylableField } from './blocks';
import { pagePlacements } from './placements';
import { editorMode, unavailable } from './storage/config';
import { localPublished } from './storage/local';
import { sanityPublished } from './storage/sanity';
import { editorStates, persist, siteEditorWritable } from './storage/repository';
export { siteEditorWritable, seedPublishedPages } from './storage/repository';
import type { PageState } from './storage/types';
import {
  newPageKind,
  pagePathSchema,
  pageSchema,
  pageTemplateSchema,
  pageTitleSchema,
  reservedPaths,
  validateEdit,
} from './validation';
import type { EditorPage, PageTemplateId, SitePage } from './types';

function view(state: PageState | undefined, seed?: SitePage): EditorPage {
  const saved = state?.draft ?? state?.published;
  if (!saved && !seed) throw new HttpError(404, 'Сторінку не знайдено.');
  // Refresh the managed template after an application update, retaining matches by stable ID.
  // An editor can immediately maintain newly introduced fields even on an older publication.
  const page =
    saved && seed
      ? {
          ...seed,
          title: saved.title,
          sections: [
            ...seed.sections.map((section) => {
              const fields = new Map(
                saved.sections
                  .find((item) => item.id === section.id)
                  ?.fields.map((field) => [field.id, field]),
              );
              return {
                ...section,
                fields: section.fields.map((field) => {
                  const prior = fields.get(field.id);
                  if (prior?.kind !== field.kind) return field;
                  return {
                    ...field,
                    value: prior.value,
                    ...(prior.style && isStylableField(field) && { style: prior.style }),
                  };
                }),
              };
            }),
            ...saved.sections.filter((section) => section.blockType),
          ],
        }
      : (saved ?? seed);
  const editable = pageSchema.parse(page);
  // When a later design retires a location, keep its blocks editable at the page end.
  const slots = new Set(pagePlacements(editable).map(({ id }) => id));
  for (const section of editable.sections) {
    if (section.blockType && section.placement && !slots.has(section.placement))
      delete section.placement;
  }
  return {
    page: editable,
    revision: state?.revision ?? null,
    hasDraft: Boolean(state?.draft),
    published: Boolean(state?.published || seed),
  };
}

export async function getEditorPage(path: string) {
  pagePathSchema.parse(path);
  const [seeds, states] = await Promise.all([getSiteSeeds(), editorStates(path)]);
  return view(
    states[0],
    seeds.find((p) => p.path === path),
  );
}

export async function listEditorPages() {
  const [seeds, states] = await Promise.all([getSiteSeeds(), editorStates()]);
  const stored = new Map(states.map((s) => [s.path, s]));
  const seedMap = new Map(seeds.map((p) => [p.path, p]));
  return Array.from(new Set([...seedMap.keys(), ...stored.keys()]), (path) => {
    const { page, published, hasDraft } = view(stored.get(path), seedMap.get(path));
    return { path, kind: page.kind, title: page.title, published, hasDraft };
  });
}

// Public queries do not load private drafts or call the admin view.
export async function getPublishedPage(path: string): Promise<SitePage | null> {
  const mode = editorMode();
  if (mode === 'readonly') return null;
  const pages = mode === 'local' ? localPublished(path) : await sanityPublished(path);
  return pages[0] ? pageSchema.parse(pages[0]) : null;
}

export async function listPublishedPages(): Promise<SitePage[]> {
  const mode = editorMode();
  if (mode === 'readonly') return [];
  const pages = mode === 'local' ? localPublished() : await sanityPublished();
  return pages.flatMap((page) => (page ? [pageSchema.parse(page)] : []));
}

export async function createSiteDraft(
  path: string,
  title: string,
  kind: SitePage['kind'],
  template?: PageTemplateId,
) {
  if (!siteEditorWritable()) throw unavailable();
  const parsedKind = newPageKind.parse(kind);
  pagePathSchema.parse(path);
  const seeds = await getSiteSeeds();
  if (reservedPaths.has(path) || seeds.some((p) => p.path === path))
    throw new HttpError(409, 'Цю адресу вже використовує сайт. Виберіть іншу.');
  const page = newSitePage(path, pageTitleSchema.parse(title), parsedKind);
  const draft =
    template === undefined ? page : applyPageTemplate(page, pageTemplateSchema.parse(template));
  return view(await persist(draft, null, false));
}

export async function writeSitePage(input: unknown, revision: string | null, publish: boolean) {
  if (!siteEditorWritable()) throw unavailable();
  const request = pageSchema.parse(input);
  const [seeds, states] = await Promise.all([getSiteSeeds(), editorStates(request.path)]);
  const seed = seeds.find((p) => p.path === request.path);
  const current = view(states[0], seed);
  const base =
    seed ??
    newSitePage(current.page.path, current.page.title, newPageKind.parse(current.page.kind));
  const baseline =
    !seed && current.page.template ? templateShell(base, current.page.template) : base;
  const page = validateEdit(request, baseline, Boolean(seed), publish);
  if (
    page.offerId &&
    (page.kind !== 'workshop' ||
      page.template !== 'workshop-intensive' ||
      findWorkshopOffer(page.path)?.offering.id !== page.offerId)
  )
    throw new HttpError(400, 'Оберіть квиток, налаштований для цієї сторінки.');
  return view(await persist(page, revision, publish), seed);
}
