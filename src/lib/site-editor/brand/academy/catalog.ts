import type { ImageAsset, Program } from '@/lib/content/types';
import { studioAcademyCourses, studioProgramImage } from '@/lib/studio-pages/selectors';
import { sectionBindings } from '../../bindings';
import type { SitePage } from '../../types';

export function academyCatalogContent(programs: Program[], images: ImageAsset[], page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const courses = studioAcademyCourses(programs).map((program) => {
    const field = section('catalog-' + program.id, 'Курс · ' + program.title);
    const original = studioProgramImage(program, images);
    const view = {
      ...program,
      title: field('title', 'Назва', program.title),
      homepageDescription: field(
        'description',
        'Короткий опис',
        program.homepageDescription || program.description,
        'multiline',
      ),
    };
    const asset = original && {
      ...original,
      src: field('image', 'Фото в списку курсів', original.src, 'image'),
    };
    return { program: view, asset };
  });
  const original = programs.find((program) => program.slug === 'ai-artwork');
  const intensive = original && {
    ...original,
    shortTitle: section('featured-workshop', 'Актуальний воркшоп')(
      'title',
      'Назва',
      original.shortTitle,
    ),
  };
  return { sections, courses, intensive };
}
