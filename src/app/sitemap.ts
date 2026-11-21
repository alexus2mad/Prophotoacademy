import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';
import { listNewSitePages } from '@/lib/site-editor/public';
import { academyCanonical } from '@/lib/seo/urls';
import { academySitemap, indexingDisabled } from '@/lib/seo/crawl';
import { academyDesign } from '@/lib/studio-design/variant';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (indexingDisabled()) return [];
  const existing = academySitemap(await getContent(), academyDesign());
  const pages = await listNewSitePages();
  return [...existing, ...pages.map((page) => ({ url: academyCanonical(page.path) }))];
}
