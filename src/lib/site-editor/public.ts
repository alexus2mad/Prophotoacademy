import 'server-only';
import { notFound } from 'next/navigation';
import { HttpError } from '@/lib/http';
import { currentMember } from '@/lib/auth/server';
import { getEditorPage, getPublishedPage, listPublishedPages } from './store';
import { getSiteSeeds } from './seeds';
import { withEditorTarget } from './storage/config';
import { parseTarget } from './storage/target';
import type { SitePage, SiteRouteProps } from './types';

export async function readSitePage(
  path: string,
  searchParams?: SiteRouteProps['searchParams'],
): Promise<SitePage | undefined> {
  const params = await searchParams;
  if (params?.['site-editor-preview'] === '1') {
    if ((await currentMember())?.role !== 'admin') notFound();
    try {
      // Production's admin previews staging content with production's own templates.
      const target = parseTarget(params['site-editor-env']);
      const page = await withEditorTarget(target, async () =>
        params['site-editor-version'] === 'published'
          ? ((await getPublishedPage(path)) ??
            (await getSiteSeeds()).find((seed) => seed.path === path))
          : (await getEditorPage(path)).page,
      );
      if (!page) notFound();
      return { ...page, editorPreview: true };
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) notFound();
      throw error;
    }
  }
  return (
    (await getPublishedPage(path)) ?? (await getSiteSeeds()).find((page) => page.path === path)
  );
}
export async function listNewSitePages() {
  return (await listPublishedPages()).filter((page) =>
    page.sections.some((section) => section.id === 'landing-cover'),
  );
}
