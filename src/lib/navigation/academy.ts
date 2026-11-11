import { academyDesign } from '../studio-design/variant';
import { studioAcademyDestinations, studioCatalogDestination } from '../studio-pages/navigation';

export const academyIndexPath = studioAcademyDestinations.overview;
export const legacyAcademyIndexPaths = new Set(['/courses', '/page-in-progress']);

/** Shared account, checkout and utility links follow the selected Academy presentation. */
export function academyProgramsHref(query?: URLSearchParams) {
  if (query && academyDesign() === 'studio') return studioCatalogDestination(query);
  const search = query?.toString();
  return `${academyIndexPath}${search ? `?${search}` : ''}`;
}

export const academyNavigation = [
  [academyIndexPath, 'Програми'],
  ['/student-work', 'Роботи студентів'],
  ['/about-us', 'Академія'],
  ['/contacts', 'Контакти'],
] as const;

export const academySupportingNavigation = academyNavigation.filter(
  ([href]) => href !== academyIndexPath,
);
