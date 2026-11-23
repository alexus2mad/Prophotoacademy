import type { Testimonial } from '@/lib/content/types';
import { studioReviews } from '@/lib/studio-reviews/reviews';
import { sectionBindings } from '../bindings';
import type { SitePage } from '../types';
import type { BrandReviewVariant } from './types';

export function brandReviewContent(variant: BrandReviewVariant, page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const heading = section('reviews-heading', 'Відгуки · заголовок');
  const course = variant === 'creator' || variant === 'food';
  const label = heading('eyebrow', 'Надзаголовок', course ? 'Відгуки' : 'Відгуки учнів');
  const title =
    variant === 'home'
      ? heading('title', 'Початок цитати', '«Мій бренд говорить одразу,')
      : heading('title', 'Заголовок', course ? 'Що кажуть' : 'Що кажуть випускники');
  const accent =
    variant === 'academy'
      ? ''
      : heading('accent', 'Рукописний акцент', variant === 'home' ? '*не залежу' : '*випускники');
  const prefix = variant === 'home' ? heading('prefix', 'Початок другого рядка', 'я') : '';
  const end = variant === 'home' ? heading('end', 'Завершення цитати', 'від підрядників»') : '';
  const credit =
    variant === 'home'
      ? heading('author', 'Авторка цитати', 'Яна Тітова, власниця бренду взуття ручної роботи')
      : '';
  const frame =
    variant === 'food'
      ? {
          intro: heading(
            'intro',
            'Вступ',
            'Тисячі випускників вже переконалися в тому, що неважливо, на що ви знімаєте, важливо те, як ви це робите',
            'multiline',
          ),
          outro: heading(
            'outro',
            'Підсумок',
            'Ми навчаємо бачити та вміти працювати з композицією, кольором, світлом та налаштуванням камери',
            'multiline',
          ),
          note: heading('note', 'Підпис', 'Ви можете знімати на камеру, на телефон, на плівку'),
        }
      : undefined;
  const reviews = studioReviews.map((review) => {
    const field = section('review-' + review.id, 'Відгук · ' + review.name);
    return {
      ...review,
      name: field('name', 'Ім’я', review.name),
      title: field('title', 'Заголовок', review.title),
      quote: field('quote', 'Текст відгуку', review.quote, 'multiline'),
    };
  });
  return { sections, label, title, accent, prefix, end, credit, frame, reviews };
}

export function programReviewContent(originals: Testimonial[], page?: SitePage) {
  const { sections, section } = sectionBindings(page);
  const heading = section('reviews-heading', 'Відгуки · заголовок');
  const label = heading('eyebrow', 'Надзаголовок', 'Відгуки');
  const title = heading('title', 'Заголовок', 'Що кажуть випускники');
  const reviews = originals.map((review) => {
    const field = section('review-' + review.id, 'Відгук · ' + review.name);
    return {
      ...review,
      name: field('name', 'Ім’я', review.name),
      ...(review.quote
        ? { quote: field('quote', 'Текст відгуку', review.quote, 'multiline') }
        : {}),
    };
  });
  return { sections: originals.length ? sections : [], label, title, reviews };
}
