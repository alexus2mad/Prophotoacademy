import { describe, expect, it } from 'vitest';
import {
  addBlockItem,
  createBlock,
  duplicateBlock,
  itemFieldId,
  moveBlockItem,
  removeBlockItem,
} from '../src/lib/site-editor/blocks';
import { newSitePage } from '../src/lib/site-editor/fields';
import { applyPageTemplate, pageTemplates, templateShell } from '../src/lib/site-editor/templates';
import type { SiteSection } from '../src/lib/site-editor/types';
import { validateEdit } from '../src/lib/site-editor/validation';

const base = newSitePage('/fotohrafiia', 'Фотографія', 'landing');
const write = (section: SiteSection, publish = true) =>
  validateEdit({ ...base, sections: [...base.sections, section] }, base, true, publish);
const field = (section: SiteSection, key: string) => section.fields.find((f) => f.id === key)!;

describe('marketing page composition', () => {
  it('instantiates independent editable sections for each starting layout', () => {
    for (const preset of pageTemplates) {
      const a = applyPageTemplate(base, preset.id);
      const b = applyPageTemplate(base, preset.id);
      expect(a.sections[0].id).toBe('landing-cover');
      expect(a.sections[0].fields[0]).not.toBe(b.sections[0].fields[0]);
      expect(a.sections.slice(1).map((s) => s.blockType)).toEqual(preset.blocks);
      const ids = new Set(b.sections.slice(1).map((s) => s.id));
      expect(a.sections.slice(1).some((s) => ids.has(s.id))).toBe(false);
      expect(validateEdit(a, templateShell(base, preset.id), false, false)).toEqual(a);
    }
  });

  it('preserves identity on a move and gives duplicated collections independent items and typography', () => {
    const cards = addBlockItem(createBlock('cards'));
    const [first, second] = cards.itemIds!;
    field(cards, itemFieldId(first, 'title')).value = 'Портрет';
    field(cards, itemFieldId(first, 'title')).style = { font: 'heading', size: 'large' };
    field(cards, itemFieldId(second, 'title')).value = 'Пейзаж';
    const reordered = moveBlockItem(cards, second, -1);
    expect(write(reordered).sections.at(-1)?.itemIds).toEqual([second, first]);
    expect(field(reordered, itemFieldId(first, 'title')).value).toBe('Портрет');
    const copy = duplicateBlock(reordered);
    const [copySecond, copyFirst] = copy.itemIds!;
    expect(new Set([first, second, copyFirst, copySecond]).size).toBe(4);
    expect(copy.id).not.toBe(reordered.id);
    const title = field(copy, itemFieldId(copyFirst, 'title'));
    expect(title).toMatchObject({ value: 'Портрет', style: { font: 'heading', size: 'large' } });
    title.style!.font = 'body';
    expect(field(reordered, itemFieldId(first, 'title')).style?.font).toBe('heading');
    expect(removeBlockItem(copy, copySecond).fields.some((f) => f.id.includes(copySecond))).toBe(
      false,
    );
    expect(write(copy).sections.at(-1)).toEqual(copy);
  });

  it('allows incomplete drafts and requires meaningful content, a photo and its description for publication', () => {
    for (const type of ['heading', 'paragraph', 'image', 'carousel', 'cards'] as const) {
      const section = createBlock(type);
      expect(write(section, false).sections.at(-1)).toEqual(section);
      expect(() => write(section)).toThrow();
    }
    for (const type of ['carousel', 'cards'] as const) {
      const section = createBlock(type);
      const id = section.itemIds![0];
      if (type === 'cards') field(section, itemFieldId(id, 'title')).value = 'Студійне світло';
      field(section, itemFieldId(id, 'image')).value = '/images/visual.webp';
      expect(() => write(section)).toThrow(/опишіть фотографію/);
      field(section, itemFieldId(id, 'alt')).value = 'Знімок моделі в студії';
      expect(write(section).sections.at(-1)).toEqual(section);
      const empty = removeBlockItem(section, id);
      expect(write(empty, false).sections.at(-1)).toEqual(empty);
      expect(() => write(empty)).toThrow(/один елемент/);
    }
  });

  it('rejects unsupported links, images and styles even in drafts', () => {
    const cards = createBlock('cards');
    const id = cards.itemIds![0];
    const url = field(cards, itemFieldId(id, 'href'));
    for (const link of ['', '/academy#courses', '#program', 'https://prophotoacademy.com.ua/']) {
      url.value = link;
      expect(write(cards, false).sections.at(-1)).toEqual(cards);
    }
    for (const link of [
      'javascript:alert(1)',
      '//other.example',
      '/\\other.example',
      'https://staff:pass@other.example',
    ]) {
      url.value = link;
      expect(() => write(cards, false)).toThrow(/адресу/);
    }
    url.value = '';
    url.style = { size: 'small' };
    expect(() => write(cards, false)).toThrow(/видимого тексту/);
    delete url.style;
    field(cards, itemFieldId(id, 'image')).value = '/learning/private.webp';
    expect(() => write(cards, false)).toThrow(/Оберіть зображення/);
    const paragraph = createBlock('paragraph');
    Object.assign(paragraph.fields[0], { style: { cssText: 'position:fixed' } });
    expect(() => write(paragraph, false)).toThrow();
    Object.assign(paragraph.fields[0], { style: { color: 'url(unsafe)' } });
    expect(() => write(paragraph, false)).toThrow();
  });

  it('rejects forged types, duplicate item identities, template switches and changes to native structure', () => {
    const section = createBlock('cards');
    section.itemIds!.push(section.itemIds![0]);
    expect(() => write(section, false)).toThrow(/Структура блоку/);
    const paragraph = createBlock('paragraph');
    paragraph.fields[0].id = 'price';
    expect(() => write(paragraph, false)).toThrow(/Структура блоку/);
    expect(() => validateEdit({ ...base, template: 'workshop' }, base, true, false)).toThrow();
    expect(() =>
      validateEdit(
        { ...base, sections: [createBlock('image'), ...base.sections] },
        base,
        true,
        false,
      ),
    ).toThrow();
    expect(() =>
      validateEdit({ ...base, sections: [...base.sections].reverse() }, base, true, false),
    ).toThrow();
  });
});
