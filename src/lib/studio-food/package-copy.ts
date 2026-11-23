import { siteField, siteSection } from '@/lib/site-editor/fields';
import { bindSection } from '@/lib/site-editor/bind-section';
import type { SitePage } from '@/lib/site-editor/types';

export const foodPackageSection = siteSection('package-copy', 'Короткі описи пакетів', [
  siteField('food-base', 'BASE', 'Вільний слухач'),
  siteField('food-gold-pro', 'GOLD PRO', 'Вихід на перше замовлення'),
  siteField('food-vip-pro', 'VIP PRO', 'Індивідуальний супровід'),
]);
export function foodPackageSummaries(page?: SitePage) {
  const { text } = bindSection(page, foodPackageSection);
  return Object.fromEntries(foodPackageSection.fields.map(({ id }) => [id, text(id)]));
}
