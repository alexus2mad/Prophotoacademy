import type { SiteSection } from './types';

export function placementLabel(slot: string, label: string) {
  return slot === 'end' ? label : 'Перед розділом «' + label + '»';
}

export function blockOutlineLabel(section: SiteSection) {
  const text = section.fields.find(
    (field) => ['text', 'heading', 'caption'].includes(field.id) && field.value.trim(),
  )?.value;
  return section.blockType && text
    ? section.label + ' · ' + text.trim().slice(0, 48)
    : section.label;
}
