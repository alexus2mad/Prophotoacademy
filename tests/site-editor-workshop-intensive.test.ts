import { describe, expect, it } from 'vitest';
import {
  addBlockItem,
  createBlock,
  duplicateBlock,
  isStylableField,
  itemFieldId,
  moveBlockItem,
  removeBlockItem,
} from '../src/lib/site-editor/blocks';
import { newSitePage } from '../src/lib/site-editor/fields';
import { validCropPosition } from '../src/lib/site-editor/intensive';
import { intensiveTemplateBlocks } from '../src/lib/site-editor/options';
import { applyPageTemplate, templateShell } from '../src/lib/site-editor/templates';
import type { SiteSection } from '../src/lib/site-editor/types';
import { validateEdit } from '../src/lib/site-editor/validation';

const source = newSitePage('/test-intensive', 'Тестовий інтенсив', 'workshop');
const shell = templateShell(source, 'workshop-intensive');
const at = (section: SiteSection, key: string) => section.fields.find((f) => f.id === key)!;
const fieldValues = (section: SiteSection, values: Record<string, string>) =>
  Object.entries(values).forEach(([id, value]) => {
    at(section, id).value = value;
  });

describe('editor-authored workshop intensive', () => {
  it('allows a partial draft, then publishes all five populated sections with native photo cover', () => {
    const page = applyPageTemplate(source, 'workshop-intensive');
    expect(page.sections.slice(1).map((s) => s.blockType)).toEqual(intensiveTemplateBlocks);
    expect(validateEdit(page, shell, false, false)).toEqual(page);
    expect(() => validateEdit(page, shell, false, true)).toThrow(/фотографію для обкладинки/);
    const [cover, intro, program, gallery, format, offer] = page.sections;
    fieldValues(cover, {
      image: '/images/visual.webp',
      alt: 'Портрет у студії',
      facts: 'Офлайн\nКиїв',
    });
    fieldValues(intro, { heading: 'Предметна\nзйомка', description: 'Робота зі світлом' });
    fieldValues(program, {
      heading: 'Програма',
      [itemFieldId(program.itemIds![0], 'title')]: 'Практика',
      [itemFieldId(program.itemIds![0], 'text')]: '**Світло** на прикладах\nФон',
    });
    fieldValues(gallery, {
      heading: 'Фотографії',
      [itemFieldId(gallery.itemIds![0], 'image')]: '/images/visual.webp',
    });
    fieldValues(format, {
      heading: 'Формат',
      [itemFieldId(format.itemIds![0], 'title')]: 'Практика у студії',
    });
    fieldValues(offer, { heading: 'Участь', title: 'Квиток' });
    expect(() => validateEdit(page, shell, false, true)).toThrow(/опишіть фотографію 1/);
    fieldValues(gallery, {
      [itemFieldId(gallery.itemIds![0], 'alt')]: 'Приклад портретного світла',
    });
    expect(validateEdit(page, shell, false, true)).toEqual(page);
    at(program, itemFieldId(program.itemIds![0], 'text')).value = '  ';
    expect(() => validateEdit(page, shell, false, true)).toThrow(/пункти теми 1/);
    expect(validateEdit(page, shell, false, false)).toEqual(page);
  });

  it.each(['intensive-program', 'intensive-gallery', 'intensive-format'] as const)(
    'keeps %s items editable after reordering, cloning or removal',
    (type) => {
      const section = addBlockItem(createBlock(type));
      const [first, second] = section.itemIds!;
      const key = type === 'intensive-gallery' ? 'alt' : 'title';
      at(section, itemFieldId(first, key)).value = 'Перший';
      at(section, itemFieldId(second, key)).value = 'Другий';
      const moved = moveBlockItem(section, second, -1);
      expect(moved.itemIds).toEqual([second, first]);
      expect(at(moved, itemFieldId(second, key)).value).toBe('Другий');
      const copy = duplicateBlock(moved);
      expect(at(copy, itemFieldId(copy.itemIds![0], key)).value).toBe('Другий');
      expect(copy.itemIds).not.toContain(first);
      const removed = removeBlockItem(moved, first);
      expect(removed.fields.some((f) => f.id.includes(first))).toBe(false);
      const empty = removeBlockItem(removed, second);
      at(empty, 'heading').value = 'Заголовок';
      const candidate = { ...shell, sections: [...structuredClone(shell.sections), empty] };
      fieldValues(candidate.sections[0], { image: '/images/visual.webp', alt: 'Портрет' });
      expect(() => validateEdit(candidate, shell, false, true)).toThrow(/один елемент/);
    },
  );

  it('accepts bounded percentages; rejects invalid crops, protected image paths and forged controls in drafts', () => {
    for (const value of ['', '50% 30%', '62% 40%', '0% 100%', '35.5% 0%'])
      expect(validCropPosition(value)).toBe(true);
    for (const value of ['1% 101%', '-20% 40%', '50% 20px', 'center', 'url(test)'])
      expect(validCropPosition(value)).toBe(false);
    const page = applyPageTemplate(source, 'workshop-intensive');
    const gallery = page.sections[3];
    const id = gallery.itemIds![0];
    const crop = at(gallery, itemFieldId(id, 'position'));
    crop.value = 'center';
    expect(isStylableField(crop)).toBe(false);
    expect(() => validateEdit(page, shell, false, false)).toThrow(/координати/);
    crop.value = '';
    at(gallery, itemFieldId(id, 'image')).value = '/learning/private.webp';
    expect(() => validateEdit(page, shell, false, false)).toThrow(/Оберіть зображення/);
    at(gallery, itemFieldId(id, 'image')).value = '';
    gallery.fields.push({ ...crop, id: 'href', value: '/checkout' });
    expect(() => validateEdit(page, shell, false, false)).toThrow(/Структура блоку/);
  });
});
