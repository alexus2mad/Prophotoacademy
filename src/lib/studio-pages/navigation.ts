export const studioAcademyDestinations = {
  overview: '/academy',
  courses: '/academy#courses',
} as const;

/** Keep bookmarked catalog URLs and campaign parameters on the approved journey. */
export function studioCatalogDestination(query: URLSearchParams) {
  const search = query.toString();
  const section = query.get('category') === 'course' ? '#courses' : '';
  return `${studioAcademyDestinations.overview}${search ? `?${search}` : ''}${section}`;
}
