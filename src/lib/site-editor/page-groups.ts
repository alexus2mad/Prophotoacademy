import type { PageGroup, PageGroupId, SitePageSummary } from './types';

// Sections mirror the public navigation. Pages outside it fall back to their kind.
const groups: Record<PageGroupId, string> = {
  home: 'Головна та Академія',
  courses: 'Курси',
  workshops: 'Воркшопи та інтенсиви',
  training: 'Навчання на замовлення',
  services: 'Студія, магазин та AI',
  about: 'Про академію',
  legal: 'Юридичні документи',
  other: 'Інші сторінки',
};
const order = Object.keys(groups) as PageGroupId[];
const fixed: Record<string, PageGroupId> = {
  '/': 'home',
  '/academy': 'home',
  '/individual-training': 'training',
  '/corporate-training': 'training',
  '/photo-studio': 'services',
  '/shop': 'services',
  '/ai-artwork': 'services',
  '/about-us': 'about',
  '/student-work': 'about',
  '/reviews': 'about',
  '/contacts': 'about',
  '/terms-of-service': 'legal',
  '/privacy-policy': 'legal',
};

export function pageGroupId(page: Pick<SitePageSummary, 'path' | 'kind'>): PageGroupId {
  if (fixed[page.path]) return fixed[page.path];
  if (page.kind === 'home') return 'home';
  if (page.kind === 'course') return 'courses';
  if (page.kind === 'workshop') return 'workshops';
  return 'other';
}

export const pageGroupLabel = (page: Pick<SitePageSummary, 'path' | 'kind'>) =>
  groups[pageGroupId(page)];

/** Group pages by site section in navigation order, keeping each section's input order. */
export function groupPages<T extends Pick<SitePageSummary, 'path' | 'kind'>>(
  pages: T[],
): PageGroup<T>[] {
  return order
    .map((id) => ({ id, label: groups[id], pages: pages.filter((p) => pageGroupId(p) === id) }))
    .filter((group) => group.pages.length > 0);
}
