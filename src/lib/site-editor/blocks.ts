import { siteField } from './fields';
import type { BlockDefinition, BlockType, SiteField, SiteSection } from './types';

export const blockLibrary = [
  { type: 'heading', label: 'Заголовок', description: 'Назва нового розділу сторінки' },
  { type: 'paragraph', label: 'Абзац', description: 'Один або кілька абзаців тексту' },
  { type: 'image', label: 'Фотографія', description: 'Зображення з необов’язковим підписом' },
  {
    type: 'cards',
    label: 'Картки',
    description: 'Добірка матеріалів із заголовками та посиланнями',
  },
  { type: 'carousel', label: 'Карусель', description: 'Фотографії, які можна гортати' },
] as const satisfies ReadonlyArray<BlockDefinition>;

export const maxBlockItems = 40;

export function isStylableField(field: SiteField) {
  return (
    field.kind !== 'image' &&
    !/(?:^|-)(?:alt|href|url|slug|price|date|email|phone|action|cta)(?:-|$)/.test(field.id)
  );
}

export function itemFieldId(itemId: string, key: string) {
  return 'item-' + itemId + '-' + key;
}

export function isCollection(type: BlockType | undefined) {
  return type === 'cards' || type === 'carousel';
}

function itemFields(type: BlockType, itemId: string) {
  const field = (key: string, label: string, kind: SiteField['kind'] = 'text') =>
    siteField(itemFieldId(itemId, key), label, '', kind);
  const image = [field('image', 'Фотографія', 'image'), field('alt', 'Опис фотографії')];
  return type === 'cards'
    ? [
        field('title', 'Заголовок картки'),
        field('text', 'Текст картки', 'multiline'),
        ...image,
        field('href', 'Посилання'),
      ]
    : [...image, field('caption', 'Підпис')];
}

// Each item shares its block's ordinary field list so the inspector, canvas and image
// references use exactly the same stable field addresses after an item moves.
export function blockFields(type: BlockType, itemIds: readonly string[] = []): SiteField[] {
  switch (type) {
    case 'heading':
      return [siteField('heading', 'Заголовок', '')];
    case 'paragraph':
      return [siteField('text', 'Текст', '', 'multiline')];
    case 'image':
      return [
        siteField('image', 'Фотографія', '', 'image'),
        siteField('alt', 'Опис фотографії', ''),
        siteField('caption', 'Підпис', ''),
      ];
    case 'cards':
    case 'carousel':
      return [
        siteField('heading', 'Заголовок розділу', ''),
        ...itemIds.flatMap((id) => itemFields(type, id)),
      ];
  }
}

export function createBlock(blockType: BlockType): SiteSection {
  const itemIds = isCollection(blockType) ? [crypto.randomUUID()] : undefined;
  return {
    id: 'block-' + crypto.randomUUID(),
    label: blockLibrary.find((entry) => entry.type === blockType)!.label,
    blockType,
    ...(itemIds && { itemIds }),
    fields: blockFields(blockType, itemIds),
  };
}

function withItems(section: SiteSection, itemIds: string[]): SiteSection {
  if (!section.blockType || !isCollection(section.blockType)) return section;
  const existing = new Map(section.fields.map((field) => [field.id, field]));
  return {
    ...section,
    itemIds,
    fields: blockFields(section.blockType, itemIds).map((field) => existing.get(field.id) ?? field),
  };
}

export function addBlockItem(section: SiteSection) {
  if (!section.itemIds || section.itemIds.length >= maxBlockItems) return section;
  return withItems(section, [...section.itemIds, crypto.randomUUID()]);
}

export function removeBlockItem(section: SiteSection, id: string) {
  if (!section.itemIds?.includes(id)) return section;
  return withItems(
    section,
    section.itemIds.filter((item) => item !== id),
  );
}

export function moveBlockItem(section: SiteSection, id: string, direction: -1 | 1) {
  const items = [...(section.itemIds ?? [])];
  const index = items.indexOf(id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= items.length) return section;
  [items[index], items[next]] = [items[next], items[index]];
  return withItems(section, items);
}

export function duplicateBlock(section: SiteSection): SiteSection {
  if (!section.blockType) throw new Error('Оберіть блок із бібліотеки.');
  const copy = structuredClone(section);
  copy.id = 'block-' + crypto.randomUUID();
  if (section.itemIds) {
    copy.itemIds = section.itemIds.map(() => crypto.randomUUID());
    const newFields = blockFields(section.blockType, copy.itemIds);
    const oldFields = blockFields(section.blockType, section.itemIds);
    const mapped = new Map(copy.fields.map((field) => [field.id, field]));
    copy.fields = newFields.map((field, i) => ({ ...mapped.get(oldFields[i].id)!, id: field.id }));
  }
  return copy;
}
