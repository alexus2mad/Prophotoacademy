import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';
import { canonicalUrl } from '@/lib/ecosystem';
import { indexingDisabled } from '@/lib/seo/crawl';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (indexingDisabled()) return [];
  const content = await getContent();
  return [
    '',
    'contact',
    'about',
    ...content.rooms.map((room) => room.slug),
    ...content.practiceSessions
      .filter((session) => session.status !== 'paused')
      .map((session) => session.slug),
  ].map((path) => ({
    url: canonicalUrl('hub', path),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));
}
