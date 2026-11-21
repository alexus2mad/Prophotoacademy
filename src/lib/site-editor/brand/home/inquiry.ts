import { siteField, siteSection } from '../../fields';

export const homeInquiry = siteSection('inquiry', 'Консультація', [
  siteField('title', 'Заголовок', 'Готові бачити'),
  siteField('emphasis', 'Акцент заголовка', 'більше?'),
  siteField(
    'intro',
    'Вступ',
    'Заповніть форму та отримайте безкоштовну консультацію з нашим спеціалістом.',
  ),
]);
