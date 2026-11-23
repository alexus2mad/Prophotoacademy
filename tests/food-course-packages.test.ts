import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '@/lib/content/types';
import type { SitePage } from '@/lib/site-editor/types';
import { buildSiteSeeds } from '@/lib/site-editor/seed-model';
import { StudioCreatorPackages } from '@/components/organisms/StudioCreatorPackages/StudioCreatorPackages';
import { StudioCreatorStory } from '@/components/organisms/StudioCreatorStory/StudioCreatorStory';
import { foodEditorial } from '@/lib/studio-food/content';

const content = fixture as AcademyContent;
const program = content.programs.find((p) => p.id === 'program-food')!;
const offering = content.offerings.find((o) => o.programId === program.id)!;
function renderPackages(ids = offering.packages.map((pack) => pack.id), page?: SitePage) {
  return load(
    renderToStaticMarkup(
      createElement(StudioCreatorPackages, {
        program,
        offering,
        enrollment: { mode: 'mock', packageIds: ids },
        page,
      }),
    ),
  );
}

describe('Food package and curriculum presentation', () => {
  it('shows summaries, sale prices and independent checkout actions while each native disclosure starts closed', () => {
    const $ = renderPackages();
    expect(
      $('#packages .package-card header p')
        .map((_, n) => $(n).text())
        .get(),
    ).toEqual(['Вільний слухач', 'Вихід на перше замовлення', 'Індивідуальний супровід']);
    const cards = $('#packages article.package-card');
    expect(cards).toHaveLength(3);
    cards.each((i, el) => {
      const card = $(el),
        pack = offering.packages[i];
      const disclosure = card.children('details');
      expect(disclosure.is('[open]')).toBe(false);
      expect(disclosure.find('summary').text()).toBe('Що входить у пакет');
      expect(disclosure.find('[data-installment-methods]')).toHaveLength(1);
      expect(
        disclosure
          .find('li')
          .filter((_, n) => $(n).closest('.check-list').length > 0)
          .map((_, n) => $(n).text())
          .get(),
      ).toEqual(pack.includes);
      expect(Number(card.find('.price-amount').text().replace(/\s/g, ''))).toBe(pack.price);
      expect(card.find('.package-action a').attr('href')).toBe(
        '/checkout?offering=' + offering.id + '&package=' + pack.id,
      );
      expect(disclosure.find('a')).toHaveLength(0);
    });
    expect(cards.find('[aria-label="Найпопулярніший пакет"]').text()).toBe('ТОП');
    expect(cards.eq(1).find('[aria-label="Найпопулярніший пакет"]')).toHaveLength(1);
  });
  it('gates checkout and installment information for each package independently', () => {
    const $ = renderPackages([offering.packages[0].id]);
    const cards = $('#packages article.package-card');
    expect(cards.find('.package-action a')).toHaveLength(1);
    expect(cards.find('[data-installment-methods]')).toHaveLength(1);
    expect(cards.eq(1).find('details .check-list li')).not.toHaveLength(0);
    expect(cards.eq(1).find('.package-action button').text()).toBe('Уточнити пакет');
  });
  it('binds each Food summary to its own marketing field and does not expose commerce controls to the editor', () => {
    const page = structuredClone(
      buildSiteSeeds(content).find((seed) => seed.path === '/' + program.slug)!,
    );
    const field = page.sections
      .find((section) => section.id === 'package-copy')!
      .fields.find((f) => f.id === 'food-gold-pro')!;
    field.value = 'Для практики';
    const $ = renderPackages(undefined, page);
    const summary = $('[data-site-section="package-copy"] [data-site-field="food-gold-pro"]');
    expect(summary.text()).toBe('Для практики');
    expect(summary.closest('[data-site-locked]')).toHaveLength(0);
    expect($('.package-card .price[data-site-locked]')).toHaveLength(3);
  });
  it('highlights one phrase in each topic without changing the curriculum text', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioCreatorStory, {
          program,
          editorial: foodEditorial,
          duration: offering.duration,
        }),
      ),
    );
    const topics = $('#program-curriculum li');
    expect(topics.map((_, n) => $(n).text()).get()).toEqual(
      program.modules.flatMap((m) => m.topics),
    );
    expect(topics.find('strong')).toHaveLength(topics.length);
    expect(topics.first().find('strong').text()).toBe('камери телефону');
    expect(topics.last().find('strong').text()).toBe('Випуск');
  });
});
