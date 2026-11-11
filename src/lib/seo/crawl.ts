import type { AcademyContent } from '@/lib/content/types';
import type { AcademyDesign } from '@/lib/studio-design/types';
import { legacyAcademyIndexPaths } from '../navigation/academy';
import { academyCanonical } from './urls';

export const nonIndexableRoutes = [
  '/account',
  '/admin',
  '/api',
  '/checkout',
  '/demo',
  '/learn',
  '/login',
  '/operations',
  '/photo-studio',
  '/shop',
  '/studio',
  '/thanks',
];

export function indexingDisabled() {
  const configured = process.env.SEO_INDEXABLE;
  if (configured && configured !== 'true' && configured !== 'false')
    throw new Error('SEO_INDEXABLE must be true or false');
  return configured === 'false' || process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages';
}

export function academySitemap(
  content: Pick<AcademyContent, 'programs' | 'pages'>,
  design: AcademyDesign,
) {
  const publicRoutes = ['/about-us', '/contacts', '/reviews', '/student-work'];
  const fixed = [
    '/',
    '/academy',
    ...publicRoutes,
    ...(design === 'studio' || content.programs.some(({ slug }) => slug === 'ai-artwork')
      ? ['/ai-artwork']
      : []),
  ];
  const reserved = new Set([
    ...fixed,
    ...nonIndexableRoutes,
    '/academy',
    '/ai-artwork',
    ...legacyAcademyIndexPaths,
    '/hub',
    '/401',
    '/404',
  ]);
  const editorial = [...content.programs, ...content.pages].flatMap(({ slug }) => {
    const path = `/${slug}`;
    return /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug) && !reserved.has(path) ? [path] : [];
  });
  return [...new Set([...fixed, ...editorial])].map((path) => ({ url: academyCanonical(path) }));
}
