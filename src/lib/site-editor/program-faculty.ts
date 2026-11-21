import type { StudioProgramInstructor } from '@/lib/studio-program/types';
import { sectionBindings } from './bindings';
import type { SitePage } from './types';

export function programFacultyContent(people: StudioProgramInstructor[], page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const instructors = people.map((person) => {
    const field = section('instructor-' + person.id, 'Викладач · ' + person.name);
    return {
      ...person,
      name: field('name', 'Ім’я', person.name),
      role: field('role', 'Спеціалізація', person.role),
      bio: field('bio', 'Біографія', person.bio, 'multiline'),
      asset: { ...person.asset, src: field('image', 'Портрет', person.asset.src, 'image') },
      alt: field('image-alt', 'Опис фотографії', person.alt),
    };
  });
  return { sections, instructors };
}
