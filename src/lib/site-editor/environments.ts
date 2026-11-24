import type { EditorTarget } from './storage/types';
import type { BrowserPage, EnvironmentState, SitePageSummary } from './types';
import type { SyncStatus } from './sync/types';

export const environmentLabels: Record<EditorTarget, string> = {
  staging: 'Staging',
  production: 'Prod',
};

const state = (page: SitePageSummary): EnvironmentState => ({
  published: page.published,
  hasDraft: page.hasDraft,
  updatedAt: page.updatedAt ?? null,
});

/** One row per address with each environment's state; production order first, staging-only last. */
export function mergeEnvironments(
  production: SitePageSummary[],
  staging?: SitePageSummary[],
  differences: Record<string, SyncStatus> = {},
): BrowserPage[] {
  const rows = new Map<string, BrowserPage>();
  for (const page of production)
    rows.set(page.path, {
      path: page.path,
      title: page.title,
      kind: page.kind,
      cover: page.cover,
      production: state(page),
    });
  for (const page of staging ?? []) {
    const row = rows.get(page.path);
    if (row) {
      row.staging = state(page);
      row.cover ??= page.cover;
    } else
      rows.set(page.path, {
        path: page.path,
        title: page.title,
        kind: page.kind,
        cover: page.cover,
        staging: state(page),
      });
  }
  for (const row of rows.values()) if (differences[row.path]) row.differs = differences[row.path];
  return Array.from(rows.values());
}

export function stateLabel(state?: EnvironmentState) {
  if (!state) return 'Немає';
  if (state.hasDraft) return state.published ? 'Чернетка' : 'Нова чернетка';
  return state.published ? 'Опубліковано' : 'Не опубліковано';
}

export function stateTone(state?: EnvironmentState): 'live' | 'draft' | 'none' {
  if (!state) return 'none';
  return state.hasDraft || !state.published ? 'draft' : 'live';
}

/** Pages with a draft or a staging version that production does not have yet. */
export const needsAttention = (page: BrowserPage) =>
  Boolean(page.differs || page.production?.hasDraft || page.staging?.hasDraft);

/** Admin-only rendering of the saved draft or published version with this site's templates. */
export function previewHref(path: string, target: EditorTarget, version: 'draft' | 'published') {
  const params = new URLSearchParams({ 'site-editor-preview': '1' });
  if (target === 'staging') params.set('site-editor-env', 'staging');
  if (version === 'published') params.set('site-editor-version', 'published');
  return path + '?' + params;
}
