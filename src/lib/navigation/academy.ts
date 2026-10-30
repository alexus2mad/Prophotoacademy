export const academyNavigation = [
  ['/courses', 'Програми'],
  ['/student-work', 'Роботи студентів'],
  ['/about-us', 'Академія'],
  ['/contacts', 'Контакти'],
] as const;

export const academySupportingNavigation = academyNavigation.filter(
  ([href]) => href !== '/courses',
);
