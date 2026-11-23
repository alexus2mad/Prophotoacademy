import { siteField, siteSection } from '../fields';

export const studentWorksHeading = siteSection('gallery-heading', 'Роботи студентів · вступ', [
  siteField('title', 'Заголовок', 'Роботи'),
  siteField('accent', 'Рукописний акцент', '*студентів'),
  siteField(
    'description',
    'Вступ',
    'Кожна робота — шлях від «як налаштувати камеру» до розуміння композиції, світла, кольору й ідеї зйомки.',
    'multiline',
  ),
]);
