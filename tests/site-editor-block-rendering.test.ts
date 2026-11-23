import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { MarketingBlock } from '@/components/molecules/MarketingBlock/MarketingBlock';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import { EditorialLandingTemplate } from '@/components/templates/EditorialLandingTemplate/EditorialLandingTemplate';
import { StudioHomeTemplate } from '@/components/templates/StudioHomeTemplate/StudioHomeTemplate';
import { addBlockItem, createBlock, itemFieldId } from '@/lib/site-editor/blocks';
import { newSitePage } from '@/lib/site-editor/fields';
import { brandSeeds } from '@/lib/site-editor/brand-seeds';
import { legalTypography } from '@/lib/site-editor/legal-typography';
import type { AcademyContent } from '@/lib/content/types';
import type { SiteSection } from '@/lib/site-editor/types';
import fixture from '../content/academy.json';

const content = fixture as AcademyContent;

function fill(section: SiteSection, key: string, value: string) {
  const field = section.fields.find((field) => field.id === key)!;
  field.value = value;
  return field;
}

describe('working and published marketing block presentation', () => {
  it('renders all block types once in page order with semantic copy, safe links, alt text and operable slides', () => {
    const page = newSitePage('/test-page', 'Перевірка', 'landing');
    const heading = createBlock('heading');
    fill(heading, 'heading', 'Світло').style = {
      font: 'editorial',
      size: 'large',
      weight: 'bold',
      align: 'center',
      color: 'accent',
    };
    const paragraph = createBlock('paragraph');
    fill(paragraph, 'text', 'Перший абзац\n\n<b>Другий абзац</b>');
    const image = createBlock('image');
    fill(image, 'image', '/images/example.webp');
    fill(image, 'alt', 'Портрет у студії');
    const cards = addBlockItem(createBlock('cards'));
    const [a, b] = cards.itemIds!;
    fill(cards, itemFieldId(a, 'title'), 'Курс');
    fill(cards, itemFieldId(a, 'href'), '#details');
    fill(cards, itemFieldId(b, 'title'), 'Без переходу');
    fill(cards, itemFieldId(b, 'href'), 'javascript:void(0)');
    const slides = addBlockItem(createBlock('carousel'));
    const [first, second] = slides.itemIds!;
    for (const [id, alt] of [
      [first, 'М’яке світло'],
      [second, 'Жорстке світло'],
    ]) {
      fill(slides, itemFieldId(id, 'image'), '/images/example.webp');
      fill(slides, itemFieldId(id, 'alt'), alt);
    }
    page.sections.push(heading, paragraph, image, cards, slides);
    const $ = load(renderToStaticMarkup(createElement(EditorialLandingTemplate, { page })));
    expect(
      $('[data-block-type]')
        .map((_, node) => $(node).attr('data-block-type'))
        .get(),
    ).toEqual(['heading', 'paragraph', 'image', 'cards', 'carousel']);
    expect($('[data-block-type="heading"] h2').text()).toBe('Світло');
    expect($('[data-block-type="heading"] h2').attr('style')).toContain('text-align:center');
    expect($('[data-block-type="paragraph"] p')).toHaveLength(2);
    expect($('[data-block-type="paragraph"] b')).toHaveLength(0);
    expect($('[data-block-type="image"] img').attr('alt')).toBe('Портрет у студії');
    expect(
      $('[data-block-type="cards"] a')
        .map((_, n) => $(n).attr('href'))
        .get(),
    ).toEqual(['#details']);
    expect(
      $('[data-block-type="carousel"] img')
        .map((_, n) => $(n).attr('alt'))
        .get(),
    ).toEqual(['М’яке світло', 'Жорстке світло']);
    expect($('[aria-label="Попереднє фото"]').is(':disabled')).toBe(true);
    expect($('[aria-label="Наступне фото"]').is(':disabled')).toBe(false);
    expect($('[data-canvas-field]')).toHaveLength(0);
  });
  it('renders new draft placeholders as keyboard editing targets and leaves public pages free of empty controls', () => {
    const section = createBlock('cards');
    const preview = load(
      renderToStaticMarkup(createElement(MarketingBlock, { section, editing: true })),
    );
    expect(preview('button[data-canvas-field="image"]').text()).toBe('Обрати фотографію');
    expect(preview('h3[tabindex="0"]').attr('data-site-field')).toBe(
      itemFieldId(section.itemIds![0], 'title'),
    );
    expect(
      renderToStaticMarkup(
        createElement(MarketingComposition, { page: newSitePage('/blank', 'Порожня', 'landing') }),
      ),
    ).toBe('');
  });
  it('formats a seeded native heading in server HTML without changing any published words or other fields', () => {
    const home = structuredClone(brandSeeds(content).find((page) => page.path === '/')!);
    const founder = home.sections.find((section) => section.id === 'founder')!;
    const field = founder.fields.find((field) => field.id === 'title')!;
    field.style = { color: 'muted' };
    const $ = load(
      renderToStaticMarkup(createElement(StudioHomeTemplate, { content, page: home })),
    );
    expect($('[data-site-section="founder"] [data-site-field="title"]').text()).toBe(field.value);
    expect($('style[data-site-typography]').text()).toContain('color:#655e5b!important');
    delete field.style;
    expect(
      load(renderToStaticMarkup(createElement(StudioHomeTemplate, { content, page: home })))(
        'style[data-site-typography]',
      ),
    ).toHaveLength(0);
  });
  it('preserves existing Portable Text marks and adds formatting only to selected legal copy', () => {
    const block = {
      _key: 'b',
      _type: 'block' as const,
      style: 'normal',
      markDefs: [],
      children: [{ _key: 's', _type: 'span' as const, text: 'Умови', marks: ['strong'] }],
    };
    const page = newSitePage('/terms', 'Умови', 'landing');
    page.sections.push({
      id: 'block-b',
      label: 'Абзац',
      fields: [
        {
          id: 'span-s',
          kind: 'multiline',
          label: 'Текст',
          value: 'Умови',
          style: { size: 'large' },
        },
      ],
    });
    expect(legalTypography([block], page)[0].children[0].marks).toEqual(['strong', 'typography-s']);
    expect(block.children[0].marks).toEqual(['strong']);
  });
});
