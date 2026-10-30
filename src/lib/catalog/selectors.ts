import type { Program } from '@/lib/content/types';
import type { CatalogCategory } from './types';

export function catalogCategory(value?: string | null): CatalogCategory {
  return value === 'course' ? 'course' : 'all';
}

export function catalogPrograms(programs: Program[], category: CatalogCategory) {
  return category === 'all'
    ? programs
    : programs.filter((program) => program.category === category);
}

export function catalogHref(category: CatalogCategory, query = '') {
  const params = new URLSearchParams(query);
  if (category === 'all') params.delete('category');
  else params.set('category', category);
  const search = params.toString();
  return '/courses' + (search ? '?' + search : '');
}
