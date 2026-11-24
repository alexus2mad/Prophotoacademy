import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MarketingBlock } from '@/components/molecules/MarketingBlock/MarketingBlock';
import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { addBlockItem, createBlock, itemFieldId } from '@/lib/site-editor/blocks';
import type { SiteSection } from '@/lib/site-editor/types';

const checkout = {
  href: '/api/checkout/workshop?offering=one&package=two',
  amount: 4200,
  price: '4 200',
  currency: 'грн',
};
function set(section: SiteSection, id: string, value: string) {
  const field = section.fields.find((f) => id === f.id);
  if (!field) throw new Error('Unexpected workshop field ' + id);
  field.value = value;
}
function render(section: SiteSection, props: Omit<MarketingBlockProps, 'section'> = {}) {
  return load(renderToStaticMarkup(createElement(MarketingBlock, { section, ...props })));
}

describe('workshop design sections in public pages and the working editor', () => {
  it('renders scalar copy using stable IDs and inherits approved typography without inline editing controls on the site', () => {
    const intro = createBlock('intensive-intro');
    set(intro, 'heading', 'Досі боїшся\nстудійних');
    set(intro, 'accent', '*спалахів?');
    set(intro, 'facts', '6 годин\nдо 7 учасників');
    const $ = render(intro);
    expect($('section').attr('aria-labelledby')).toBe($('h2').attr('id'));
    expect($('h2').text()).toBe('Досі боїшся\nстудійних *спалахів?');
    expect(
      $('[data-site-field="facts"] span')
        .map((_, node) => $(node).text())
        .get(),
    ).toEqual(['6 годин', 'до 7 учасників']);
    expect($('[data-canvas-field]')).toHaveLength(0);
    const preview = render(intro, { editing: true });
    expect(preview('[data-site-field="heading"]').attr('data-canvas-field')).toBe('multiline');
    expect(preview('[data-site-field="invitation"]').attr('tabindex')).toBe('0');
  });
  it.each(['intensive-intro', 'intensive-offer'] as const)(
    'uses the server ticket price and destination, with no editable commerce field on %s',
    (type) => {
      const block = createBlock(type);
      set(block, 'price', '1 999');
      set(block, 'currency', 'USD');
      const bound = render(block, { ticket: checkout });
      expect(bound('button[type="button"]').text()).toContain('Записатися');
      expect(bound('strong').text()).toBe('4 200');
      expect(bound('[data-site-field="price"], [data-site-field="currency"],form')).toHaveLength(0);
      const unbound = render(block);
      expect(unbound('[data-site-field="price"]').text()).toBe('1 999');
      expect(unbound('a,form,button')).toHaveLength(0);
      const editing = render(block, { editing: true, ticket: checkout });
      expect(editing('[aria-disabled="true"]').text()).toContain('Записатися');
      expect(editing('a,button')).toHaveLength(0);
      const savedPreview = render(block, { preview: true, ticket: checkout });
      expect(savedPreview('a,button,[data-canvas-field]')).toHaveLength(0);
      expect(savedPreview('[aria-disabled="true"]')).toHaveLength(1);
    },
  );
  it('uses native independent accordion disclosures, a single indicator per summary and escaped semantic bullet emphasis', () => {
    const section = addBlockItem(createBlock('intensive-program'));
    const [first, second] = section.itemIds!;
    set(section, itemFieldId(first, 'title'), 'Студійне світло');
    set(section, itemFieldId(first, 'text'), 'Перша **підказка**\n<img> та **практика**');
    set(section, itemFieldId(second, 'title'), 'Обробка');
    const $ = render(section);
    expect($('details')).toHaveLength(2);
    expect($('details[open]')).toHaveLength(1);
    expect($('details[open] summary [data-site-field]').text()).toBe('Студійне світло');
    expect($('summary > span:last-child[aria-hidden="true"]')).toHaveLength(2);
    expect(
      $('details li strong')
        .map((_, el) => $(el).text())
        .get(),
    ).toEqual(['підказка', 'практика']);
    expect($('details li img')).toHaveLength(0);
    expect($('details li').last().text()).toBe('<img> та практика');
  });
  it('creates a keyboard-accessible ordered format with stable labels that match the editor field identities', () => {
    const format = addBlockItem(createBlock('intensive-format'));
    format.itemIds!.forEach((id, i) => set(format, itemFieldId(id, 'title'), 'Формат ' + i));
    const $ = render(format, { editing: true });
    expect($('ol').attr('tabindex')).toBe('0');
    expect(
      $('ol li h3')
        .map((_, node) => $(node).attr('data-site-field'))
        .get(),
    ).toEqual(format.itemIds!.map((id) => itemFieldId(id, 'title')));
  });
  it('gives public gallery photos a dialog/controls and editable gallery photos library targets, retaining focal points', () => {
    const gallery = addBlockItem(createBlock('intensive-gallery'));
    for (const [i, id] of gallery.itemIds!.entries()) {
      set(gallery, itemFieldId(id, 'image'), '/images/work-' + i + '.webp');
      set(gallery, itemFieldId(id, 'alt'), 'Робота ' + i);
    }
    set(gallery, itemFieldId(gallery.itemIds![1], 'position'), '62% 40%');
    const $ = render(gallery);
    expect($('button[aria-haspopup="dialog"]')).toHaveLength(2);
    expect($('button[aria-haspopup="dialog"] img').first().attr('style')).toContain('50% 30%');
    expect($('button[aria-haspopup="dialog"] img').last().attr('style')).toContain('62% 40%');
    expect($('dialog')).toHaveLength(1);
    expect($('[aria-controls="' + gallery.id + '-gallery"]')).toHaveLength(2);
    const preview = render(gallery, { editing: true });
    expect(preview('dialog')).toHaveLength(0);
    expect(
      preview('[data-canvas-field="image"]')
        .map((_, el) => preview(el).attr('data-site-field'))
        .get(),
    ).toEqual(gallery.itemIds!.map((id) => itemFieldId(id, 'image')));
  });
});
