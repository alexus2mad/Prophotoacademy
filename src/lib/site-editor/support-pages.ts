import type { AcademyContent, EditorialPage } from '@/lib/content/types';
import { academyHomePhoto } from '@/lib/photography/academy-home';
import { isLegalHeading } from './legal-chapters';
import { sectionBindings } from './bindings';
import type { SitePage } from './types';

export function aboutContent(content: AcademyContent, page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const header = section('intro', 'Про академію');
  const original = academyHomePhoto('founder');
  const hero = {
    ...original,
    src: header('image', 'Портрет засновниці', original.src, 'image'),
    alt: header('image-alt', 'Опис портрета', original.alt),
  };
  const intro = {
    title: header('title', 'Назва сторінки', 'Про академію'),
    heading: header('heading', 'Заголовок вступу', 'Знання, що працюють у кадрі'),
    description: header(
      'description',
      'Перший абзац',
      'Академія навчає створювати візуальний контент на телефон і фотокамеру. Поєднуємо теорію, досвід рекламної фотографії та практику — онлайн і в Києві.',
      'multiline',
    ),
    detail: header(
      'detail',
      'Другий абзац',
      'Обирайте програму за своєю метою: освоїти основи, працювати з брендами або самостійно вести візуальний контент.',
      'multiline',
    ),
  };
  const figures = section('figures', 'Академія в цифрах');
  const stats = [
    ['6 років', 'досвіду академії'],
    ['3000+', 'випускників'],
    ['17+', 'навчальних груп'],
  ].map(([number, label], i) => ({
    number: figures('number-' + i, 'Показник ' + (i + 1), number),
    label: figures('label-' + i, 'Підпис ' + (i + 1), label),
  }));
  const teamTitle = section('team', 'Команда')('title', 'Заголовок', 'Команда академії');
  const instructors = content.instructors.map((person) => {
    const field = section('person-' + person.id, person.name);
    const image = content.images.find((i) => i.id === person.imageId) ?? content.images[0];
    return {
      ...person,
      name: field('name', 'Ім’я', person.name),
      role: field('role', 'Спеціалізація', person.role),
      bio: field('bio', 'Біографія', person.bio, 'multiline'),
      image: {
        ...image,
        src: field('image', 'Портрет', image.src, 'image'),
        alt: field('image-alt', 'Опис портрета', image.alt),
      },
    };
  });
  return { sections, intro, hero, stats, teamTitle, instructors };
}
export function contactContent(content: AcademyContent, page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const f = section('intro', 'Перший екран');
  const intro = {
    label: f('label', 'Надзаголовок', 'Контакти ProPhoto Academy'),
    accent: f('accent', 'Рукописний акцент', '*пишіть, телефонуйте'),
    title: f('title', 'Заголовок', 'Будемо раді'),
  };
  const g = section('contacts', 'Контактні дані');
  const s = content.settings;
  return {
    sections,
    intro,
    settings: {
      ...s,
      phone: g('phone', 'Телефон', s.phone),
      address: g('address', 'Адреса', s.address),
      email: g('email', 'Електронна пошта', s.email),
    },
  };
}
export function worksContent(content: AcademyContent, page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const f = section('intro', 'Перший екран');
  const title = f('title', 'Заголовок', 'Роботи студентів');
  const description = f(
    'description',
    'Вступ',
    'Фотографії на телефон і камеру, створені під час навчання в академії.',
    'multiline',
  );
  const images = [...content.images];
  const works = content.works.map((work) => {
    const field = section('work-' + work.id, work.title);
    const index = images.findIndex((i) => i.id === work.imageId);
    if (index >= 0) {
      const image = images[index];
      images[index] = {
        ...image,
        src: field('image', 'Фотографія', image.src, 'image'),
        alt: field('image-alt', 'Опис фотографії', image.alt),
      };
    }
    return { ...work, title: field('title', 'Назва роботи', work.title) };
  });
  return { sections, title, description, works, images };
}
export function reviewsContent(content: AcademyContent, page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const title = section('intro', 'Перший екран')('title', 'Заголовок', 'Відгуки студентів');
  const testimonials = content.testimonials.map((review) => {
    const f = section('review-' + review.id, review.name);
    const name = f('name', 'Автор', review.name);
    return {
      ...review,
      name,
      ...(review.quote ? { quote: f('quote', 'Відгук', review.quote, 'multiline') } : {}),
      ...(review.image ? { image: f('image', 'Зображення', review.image, 'image') } : {}),
      alt: review.image ? f('image-alt', 'Опис зображення', 'Відгук: ' + name) : '',
    };
  });
  return { sections, title, testimonials };
}
export function legalContent(original: EditorialPage, page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const title = section('intro', 'Назва сторінки')('title', 'Заголовок', original.title);
  const body = original.body.map((block, i) => {
    const label = isLegalHeading(block) ? 'Розділ · ' + (i + 1) : 'Абзац ' + (i + 1);
    const f = section('block-' + block._key, label);
    return {
      ...block,
      children: block.children.map((span, j) => ({
        ...span,
        text: f('span-' + span._key, 'Текст ' + (j + 1), span.text, 'multiline'),
      })),
    };
  });
  return { sections, title, body };
}
