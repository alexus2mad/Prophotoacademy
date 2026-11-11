import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';
  const slugs = [
    '',
    ...(academyDesign() === 'studio' ? ['academy', 'ai-artwork'] : ['courses']),
    'student-work',
    'about-us',
    'contacts',
    'reviews',
    ...content.programs.map((p) => p.slug),
    ...content.pages.map((p) => p.slug),
  ];
  return [...new Set(slugs)].map((slug) => ({
    url: `${base}/${slug}`,
    changeFrequency: slug.includes('policy') || slug.includes('terms') ? 'yearly' : 'weekly',
    priority: slug === '' ? 1 : ['courses', 'academy'].includes(slug) ? 0.9 : 0.7,
  }));
}
