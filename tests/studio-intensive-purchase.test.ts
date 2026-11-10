import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent, Offering } from '../src/lib/content/types';
import { studioIntensiveOffer } from '../src/lib/studio-pages/intensive';
import { StudioIntensiveTemplate } from '../src/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';

const content = fixture as AcademyContent;
const program = {
  ...content.programs[0],
  id: 'program-ai-artwork',
  slug: 'ai-artwork',
  title: 'Від кадрів до AI artwork',
  shortTitle: 'AI artwork',
  category: 'class' as const,
};
const offering: Offering = {
  id: 'offering-ai-artwork',
  programId: program.id,
  startDate: '2099-11-22',
  duration: '4–5 годин',
  format: 'hybrid',
  verificationRequired: false,
  availability: 'open',
  packages: [
    {
      id: 'ai-offline',
      name: 'Офлайн',
      kind: 'product',
      price: 3900,
      availability: 'open',
      description: 'Участь у студії',
      includes: [],
    },
    {
      id: 'ai-online',
      name: 'Онлайн',
      kind: 'product',
      price: 3000,
      availability: 'limited',
      description: 'Участь онлайн',
      includes: [],
    },
  ],
};
const withOffer = (intake = offering): AcademyContent => ({
  ...content,
  programs: [...content.programs.filter((entry) => entry.slug !== 'ai-artwork'), program],
  offerings: [...content.offerings.filter((entry) => entry.programId !== program.id), intake],
});

describe('AI Artwork purchase presentation', () => {
  it('keeps source-reference prices inquiry-only without a configured sale', () => {
    const empty = {
      ...content,
      programs: content.programs.filter((entry) => entry.slug !== 'ai-artwork'),
    };
    const offer = studioIntensiveOffer(empty, { mode: 'wayforpay', packageIds: ['ai-offline'] });
    expect(offer.purchaseAvailable).toBe(false);
    expect(offer.prices.map(({ label, price }) => ({ label, price }))).toEqual([
      { label: 'Офлайн', price: 3900 },
      { label: 'Онлайн', price: 3000 },
    ]);
    expect(offer.prices.every((price) => !price.purchaseUrl)).toBe(true);
    expect(offer.date).toBe('Дату уточнюємо');
  });

  it('uses configured package amounts and exact IDs rather than reference prices', () => {
    const intake = {
      ...offering,
      id: 'offering & special',
      packages: [{ ...offering.packages[0], id: 'offline & special', price: 4750 }],
    };
    const offer = studioIntensiveOffer(withOffer(intake), {
      mode: 'wayforpay',
      packageIds: ['offline & special'],
    });
    expect(offer.prices[0].price).toBe(4750);
    const url = new URL(offer.prices[0].purchaseUrl!, 'https://academy.test');
    expect(url.pathname).toBe('/checkout');
    expect([...url.searchParams]).toEqual([
      ['offering', intake.id],
      ['package', intake.packages[0].id],
    ]);
    expect(offer.purchaseAvailable).toBe(true);
    expect(offer.purchaseNotice).toBeUndefined();
  });

  it('does not turn marketing availability into permission to purchase', () => {
    expect(studioIntensiveOffer(withOffer()).purchaseAvailable).toBe(false);
    for (const mode of ['mock', 'disabled', 'wayforpay'] as const) {
      const offer = studioIntensiveOffer(withOffer(), { mode, packageIds: [] });
      expect(offer.purchaseAvailable).toBe(false);
      expect(offer.prices.every((price) => !price.purchaseUrl)).toBe(true);
    }
    const inquiry = { ...offering, packages: [{ ...offering.packages[0], inquiryOnly: true }] };
    expect(
      studioIntensiveOffer(withOffer(inquiry), {
        mode: 'wayforpay',
        packageIds: ['ai-offline'],
      }).purchaseAvailable,
    ).toBe(false);
  });

  it('renders both purchase formats with distinct links and selection anchors', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioIntensiveTemplate, {
          content: withOffer(),
          enrollment: { mode: 'wayforpay', packageIds: ['ai-offline', 'ai-online'] },
        }),
      ),
    );
    const options = $('#intensive-offers article');
    expect(options).toHaveLength(2);
    expect(
      options
        .find('h3')
        .map((_, node) => $(node).text())
        .get(),
    ).toEqual(['Офлайн', 'Онлайн']);
    expect(
      options
        .find('a')
        .map((_, node) => $(node).attr('href'))
        .get(),
    ).toEqual([
      '/checkout?offering=offering-ai-artwork&package=ai-offline',
      '/checkout?offering=offering-ai-artwork&package=ai-online',
    ]);
    expect(
      options
        .find('a')
        .map((_, node) => $(node).attr('aria-label'))
        .get(),
    ).toEqual(['Придбати: Офлайн', 'Придбати: Онлайн']);
    expect($('a[href="#intensive-offers"]')).toHaveLength(2);
    expect(
      $('a[href="#intensive-offers"]')
        .map((_, node) => $(node).text())
        .get(),
    ).toEqual(['Обрати формат →', 'Обрати формат →']);
    expect(options.find('a a, a button')).toHaveLength(0);
    expect($.text()).not.toContain('без оплати й підтвердження участі');
  });

  it('keeps unavailable formats unlinked and labels test checkout explicitly', () => {
    const mixed = {
      ...offering,
      packages: [
        offering.packages[0],
        { ...offering.packages[1], availability: 'soldOut' as const },
      ],
    };
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioIntensiveTemplate, {
          content: withOffer(mixed),
          enrollment: { mode: 'mock', packageIds: ['ai-offline'] },
        }),
      ),
    );
    expect($('#intensive-offers a')).toHaveLength(1);
    expect($('#intensive-offers article').last().text()).toContain('Місць немає');
    expect($.text()).toContain('Тестове оформлення — без оплати й підтвердження участі');
  });

  it.each([
    { ...offering, availability: 'archived' as const },
    { ...offering, startDate: '2000-01-01' },
    { ...offering, verificationRequired: true },
  ])('keeps closed or unverified offers in the inquiry flow', (intake) => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioIntensiveTemplate, {
          content: withOffer(intake),
          enrollment: { mode: 'wayforpay', packageIds: [] },
        }),
      ),
    );
    expect($('#intensive-offers a, a[href="#intensive-offers"]')).toHaveLength(0);
    expect($('button[aria-controls="inquiry-dialog"]')).toHaveLength(3);
    expect($.text()).toContain('Умови участі підтвердимо після заявки');
  });
});
