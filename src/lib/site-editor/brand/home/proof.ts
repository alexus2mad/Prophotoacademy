import { siteField, siteSection } from '../../fields';

export const homeStatistics = [
  ['15', 'років досвіду'],
  ['3000+', 'випускників'],
  ['18+', 'навчальних груп'],
  ['100%', 'практики'],
];

export const homeProof = siteSection('proof', 'Партнери й досвід', [
  siteField('title', 'Заголовок', 'Знімали та навчали для'),
  ...homeStatistics.flatMap(([value, label], i) => [
    siteField('stat-' + i + '-value', label + ' · значення', value),
    siteField('stat-' + i + '-label', label + ' · підпис', label),
  ]),
]);
