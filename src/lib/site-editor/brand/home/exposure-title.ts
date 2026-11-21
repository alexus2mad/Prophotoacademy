import { siteField, siteSection } from '../../fields';

export const homeExposureTitle = siteSection('exposure-title', 'Заголовок експозиції', [
  siteField('title', 'Заголовок', 'неважливо,'),
  siteField('emphasis', 'Акцент заголовка', 'на що ви знімаєте, важливо'),
  siteField('end', 'Завершення заголовка', 'як ви це робите'),
]);
