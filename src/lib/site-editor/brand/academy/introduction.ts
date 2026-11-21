import { siteField, siteSection } from '../../fields';

export const academyIntroduction = siteSection('introduction', 'Вступ і навігація', [
  siteField('eyebrow', 'Надзаголовок', 'ProPhoto Academy'),
  siteField('emphasis', 'Акцент заголовка', '*вчимо'),
  siteField('title', 'Заголовок', 'Бачити більше'),
  siteField(
    'intro',
    'Вступ',
    'Фотошкола в Києві з онлайн-курсами з фотографії, відео й створення контенту. Поєднуємо навчання з практикою на реальних комерційних зйомках з відомими брендами.',
    'multiline',
  ),
  siteField('course-action', 'Курс · Текст кнопки', 'Обрати курс →'),
  siteField('inquiry-action', 'Консультація · Текст кнопки', 'Отримати консультацію'),
  siteField('courses', 'Курси', 'Головні курси'),
  siteField('workshops', 'Воркшопи', 'Воркшопи'),
  siteField('individual', 'Індивідуальне навчання', 'Індивідуальне'),
  siteField('corporate', 'Корпоративне навчання', 'Корпоративне'),
  siteField('camp', 'Кемп', 'ProPhoto Кемп'),
  siteField('lecturers', 'Лектори', 'Лектори'),
  siteField('inquiry-title', 'Консультація · Заголовок', 'Допоможемо'),
  siteField('inquiry-emphasis', 'Консультація · Акцент заголовка', 'обрати'),
  siteField(
    'inquiry-description',
    'Консультація · Опис',
    'Заповніть форму та отримайте безкоштовну консультацію з нашим спеціалістом.',
  ),
]);
