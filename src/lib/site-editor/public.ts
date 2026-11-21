import 'server-only';
import { notFound } from 'next/navigation';
import { HttpError } from '@/lib/http';
import { currentMember } from '@/lib/auth/server';
import { getEditorPage, getPublishedPage, listPublishedPages } from './store';
import { getSiteSeeds } from './seeds';
import type { SitePage, SiteRouteProps } from './types';

export async function readSitePage(
  path: string,
  searchParams?: SiteRouteProps['searchParams'],
): Promise<SitePage | undefined> {
  if ((await searchParams)?.['site-editor-preview'] === '1') {
    if ((await currentMember())?.role !== 'admin') notFound();
    try {
      return (await getEditorPage(path)).page;
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
