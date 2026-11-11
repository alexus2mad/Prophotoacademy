import { academyDesign } from '@/lib/studio-design/variant';
import { studioAcademyDestinations, studioCatalogDestination } from '@/lib/studio-pages/navigation';

/** Shared account, checkout and utility links follow the selected Academy presentation. */
export function academyProgramsHref(query?: URLSearchParams) {
  if (academyDesign() === 'studio') {
    return query ? studioCatalogDestination(query) : studioAcademyDestinations.overview;
  }
  const search = query?.toString();
  return `/courses${search ? `?${search}` : ''}`;
}

export const academyNavigation = [
  ['/courses', 'Програми'],
  ['/student-work', 'Роботи студентів'],
  ['/about-us', 'Академія'],
  ['/contacts', 'Контакти'],
] as const;

export const academySupportingNavigation = academyNavigation.filter(
  ([href]) => href !== '/courses',
);
