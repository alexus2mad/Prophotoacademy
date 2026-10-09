import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';
import { canonicalUrl } from '@/lib/ecosystem';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
