import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';
import { academySitemap, indexingDisabled } from '@/lib/seo/crawl';
import { academyDesign } from '@/lib/studio-design/variant';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (indexingDisabled()) return [];
  return academySitemap(await getContent(), academyDesign());
}
