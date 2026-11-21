import type { AcademyContent, Program } from '@/lib/content/types';
import type { StudioCourseEditorial, CourseTextItem } from '@/lib/studio-creator/types';
import { courseEditorial } from '@/lib/studio-creator/selectors';
import { studioProgramArtwork, studioProgramPage } from '@/lib/studio-program/selectors';
import { brandReviewContent, programReviewContent } from './brand/reviews';
import { sectionBindings } from './bindings';
import { programFacultyContent } from './program-faculty';
import type { SitePage } from './types';

export function programPresentationContent(
  content: AcademyContent,
  original: Program,
  page?: SitePage,
) {
  const { sections, section } = sectionBindings(page);
  const info = section('overview', 'Назва та опис');
  const program = {
    ...original,
    title: info('title', 'Назва програми', original.title),
    shortTitle: info('short-title', 'Коротка назва', original.shortTitle),
    description: info('description', 'Опис', original.description, 'multiline'),
  };
  const curriculum = section('curriculum', 'Програма навчання');
  program.modules = original.modules.map((module, i) => ({
    title: curriculum('module-' + i, 'Модуль ' + (i + 1), module.title),
    topics: module.topics.map((topic, j) =>
      curriculum('topic-' + i + '-' + j, 'Тема ' + (j + 1), topic),
    ),
  }));
  const faq = section('faq', 'Запитання та відповіді');
  program.faqs = original.faqs.map((item, i) => ({
    question: faq('question-' + i, 'Запитання ' + (i + 1), item.question),
    answer: faq('answer-' + i, 'Відповідь ' + (i + 1), item.answer, 'multiline'),
  }));
  const base = courseEditorial(original);
  const originalArt = base?.hero ?? studioProgramArtwork(original, content);
  const hero = section('hero', 'Перший екран');
  const artwork = {
    asset: {
      ...originalArt.asset,
      src: hero('image', 'Головне фото', originalArt.asset.src, 'image'),
    },
    alt: hero('image-alt', 'Опис фотографії', originalArt.alt),
  };
  let editorial: StudioCourseEditorial | undefined;
  if (base) {
    const intro = section('introduction', 'Вступ');
    const textItems = (key: string, label: string, items: readonly CourseTextItem[]) => {
      const field = section(key, label);
      return items.map((item, i) => ({
        title: field('title-' + i, 'Заголовок ' + (i + 1), item.title),
        text: field('text-' + i, 'Текст ' + (i + 1), item.text, 'multiline'),
      }));
    };
    editorial = {
      ...base,
      hero: {
        ...base.hero,
        ...artwork,
        hand: hero('accent', 'Акцент', base.hero.hand),
        title: hero('title', 'Заголовок', base.hero.title),
        subject: hero('subject', 'Тема курсу', base.hero.subject),
        ...(base.hero.facts
          ? {
              facts: base.hero.facts.map((fact, i) =>
                hero('fact-' + i, 'Про курс ' + (i + 1), fact),
              ),
            }
          : {}),
      },
      intro: {
        eyebrow: intro('eyebrow', 'Надзаголовок', base.intro.eyebrow),
        heading: {
          lines: base.intro.heading.lines.map((line, i) =>
            intro('line-' + i, 'Рядок заголовка ' + (i + 1), line),
          ),
          hand: intro('accent', 'Акцент заголовка', base.intro.heading.hand),
        },
        description: intro('description', 'Текст', base.intro.description, 'multiline'),
      },
      audience: textItems('audience', 'Для кого', base.audience),
      benefits: textItems('benefits', 'Переваги', base.benefits),
      learningSteps: textItems('steps', 'Як проходить навчання', base.learningSteps),
    };
    if (base.faculty)
      editorial.faculty = base.faculty.map((person) => {
        const f = section('lecturer-' + person.id, 'Викладач · ' + person.name);
        const photo = f('portrait', 'Портрет', person.portrait?.src ?? '', 'image');
        return {
          ...person,
          name: f('name', 'Ім’я', person.name),
          roles: person.roles.map((role, i) => f('role-' + i, 'Спеціалізація ' + (i + 1), role)),
          ...(person.bio ? { bio: f('bio', 'Біографія', person.bio, 'multiline') } : {}),
          ...(photo
            ? { portrait: { width: 800, height: 1000, ...person.portrait, src: photo } }
            : { portrait: undefined }),
        };
      });
    if (base.worksOpening)
      editorial.worksOpening = {
        ...base.worksOpening,
        extras: base.worksOpening.extras.map((work) => {
          const f = section('featured-' + work.id, 'Фото · ' + work.alt);
          return {
            ...work,
            src: f('image', 'Фотографія', work.src, 'image'),
            alt: f('image-alt', 'Опис фотографії', work.alt),
          };
        }),
      };
  } else {
    program.eyebrow = info('eyebrow', 'Підзаголовок', original.eyebrow);
    if (original.deliveryDescription)
      program.deliveryDescription = info('delivery', 'Опис формату', original.deliveryDescription);
    const audience = section('audience', 'Для кого');
    program.audience = original.audience.map((item, i) =>
      audience('item-' + i, 'Аудиторія ' + (i + 1), item),
    );
    const outcomes = section('outcomes', 'Результати навчання');
    program.outcomes = original.outcomes.map((item, i) =>
      outcomes('item-' + i, 'Результат ' + (i + 1), item),
    );
  }
  const workIds = new Set(original.workIds);
  const galleryImages = new Map(
    content.works.filter((work) => workIds.has(work.id)).map((work) => [work.imageId, work.title]),
  );
  const gallery = section('gallery', 'Роботи студентів');
  const images = content.images.map((image) => {
    const label = galleryImages.get(image.id);
    return label
      ? {
          ...image,
          src: gallery(image.id, label, image.src, 'image'),
          alt: gallery(image.id + '-alt', 'Опис · ' + label, image.alt),
        }
      : image;
  });
  const generic = base ? undefined : studioProgramPage(original, content);
  const faculty = programFacultyContent(generic?.instructors ?? [], page);
  const reviews = base
    ? brandReviewContent('creator')
    : programReviewContent(generic?.reviews ?? []);
  return {
    program,
    artwork,
    editorial,
    content: { ...content, images },
    sections: [
      ...sections.filter((s) => s.fields.length),
      ...faculty.sections,
      ...reviews.sections,
    ],
  };
}
