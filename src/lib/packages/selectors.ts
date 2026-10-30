import type { Package, PackageComparisonDimension } from '../content/types';
import type { PackageComparisonRow } from './types';

export const packageComparisonDimensions: PackageComparisonRow[] = [
  { id: 'learning', label: 'Лекції та навчання' },
  { id: 'support', label: 'Підтримка викладача' },
  { id: 'homework', label: 'Перевірка домашніх завдань' },
  { id: 'practice', label: 'Практика та формат' },
  { id: 'access', label: 'Доступ до матеріалів' },
  { id: 'limits', label: 'Умови й вимоги' },
];

export function packageComparisonFact(pack: Package, dimension: PackageComparisonDimension) {
  const fact = pack.comparison?.[dimension];
  const state = fact?.state || 'unknown';
  const label =
    state === 'included'
      ? dimension === 'limits'
        ? 'Є умови'
        : 'Входить'
      : state === 'excluded'
        ? 'Не входить'
        : 'Не уточнено';
  return { state, label, text: fact?.text?.trim() };
}
