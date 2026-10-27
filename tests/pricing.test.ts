import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, describe, expect, it, vi } from 'vitest';
import seed from '../content/academy.json';
import type { AcademyContent, Offering } from '../src/lib/content/types';
import { resolvePurchase } from '../src/lib/checkout';
import { canEnroll, money } from '../src/lib/format';
import { canTestEnroll } from '../src/lib/commerce/selectors';
import { PackageCard } from '../src/components/molecules/PackageCard/PackageCard';
import { PackageComparisonTable } from '../src/components/molecules/PackageComparisonTable/PackageComparisonTable';
import { ProgramPackages } from '../src/components/organisms/ProgramPackages/ProgramPackages';

const content = seed as AcademyContent;
const purchaseDate = new Date('2026-10-27T12:00:00Z');
const render = (element: ReactElement) => load(renderToStaticMarkup(element));
const offering = (id: string) => {
  const value = content.offerings.find((item) => item.id === id);
  if (!value) throw new Error(`Missing offering ${id}`);
  return value;
};
const programFor = (item: Offering) => {
  const value = content.programs.find((program) => program.id === item.programId);
  if (!value) throw new Error(`Missing program ${item.programId}`);
  return value;
};
const commercial = offering('offering-commercial-2026-11');
const visual = offering('offering-visual-2026-03');
const instagram = offering('offering-instagram-2026-10');
const platinum = instagram.packages.find((pack) => pack.id === 'instagram-platinum');
if (!platinum) throw new Error('Missing inquiry-only Instagram PLATINUM');

afterEach(() => vi.unstubAllEnvs());

describe('approved pricing and stable package identity', () => {
  it.each([
    [
      commercial,
      [
        ['commercial-base', 9600],
        ['commercial-gold', 29900],
        ['commercial-platinum', 79900],
      ],
    ],
    [
      visual,
      [
        ['visual-base', 7500],
        ['visual-gold', 25500],
        ['visual-platinum', 63900],
      ],
    ],
    [
      instagram,
      [
        ['instagram-base', 4200],
        ['instagram-expert', 11900],
        ['instagram-platinum', 29900],
      ],
    ],
  ] as const)('keeps approved prices and stable IDs for $0.programId', (item, expected) => {
    expect(item.packages.map((pack) => [pack.id, pack.price])).toEqual(expected);
    expect(item.packages.filter((pack) => pack.featured).map((pack) => pack.name)).toEqual([
      'GOLD',
    ]);
  });

  it.each([
    [commercial.id, 'commercial-base', 9600],
    [commercial.id, 'commercial-platinum', 79900],
    [visual.id, 'visual-base', 7500],
    [visual.id, 'visual-platinum', 63900],
    [instagram.id, 'instagram-base', 4200],
  ] as const)(
    'resolves new orders from the current price source: %s / %s',
    (id, packageId, expected) => {
      vi.stubEnv('PAYMENT_MODE', 'wayforpay');
      expect(resolvePurchase(content, id, packageId, purchaseDate).pack.price).toBe(expected);
    },
  );

  it('renames the existing Instagram expert tier without replacing its identity or promises', () => {
    const gold = instagram.packages.find((pack) => pack.id === 'instagram-expert');
    expect(gold).toMatchObject({
      name: 'GOLD',
      availability: 'soldOut',
      description: 'Робота над власним експертним брендом',
      includes: ['18 лекцій', 'Чат та індивідуальна робота', 'Доступ назавжди'],
    });
    expect(gold?.previousPrice).toBeUndefined();
    expect(platinum).toMatchObject({ availability: 'waitlist', inquiryOnly: true, includes: [] });
  });

  it.each(['mock', 'wayforpay', 'disabled'])('does not reopen sold-out GOLD in %s mode', (mode) => {
    vi.stubEnv('PAYMENT_MODE', mode);
    for (const item of [commercial, visual, instagram]) {
      const gold = item.packages.find((pack) => pack.featured);
      if (!gold) throw new Error('Missing featured package');
      expect(gold.availability).toBe('soldOut');
      expect(() => resolvePurchase(content, item.id, gold.id, purchaseDate)).toThrow(
        /не підтверджено/,
      );
    }
  });
});

describe('inquiry-only package boundaries', () => {
  it.each(['mock', 'wayforpay', 'disabled'])(
    'rejects checkout in %s mode even if availability is changed to open',
    (mode) => {
      vi.stubEnv('PAYMENT_MODE', mode);
      for (const availability of ['waitlist', 'open'] as const) {
        const pack = { ...platinum, availability };
        const intake = { ...instagram, packages: [pack] };
        const candidate = { ...content, offerings: [intake] };
        expect(canEnroll(intake, pack, purchaseDate)).toBe(false);
        expect(canEnroll(intake, undefined, purchaseDate)).toBe(false);
        expect(canTestEnroll(intake, pack)).toBe(false);
        expect(() => resolvePurchase(candidate, intake.id, pack.id, purchaseDate)).toThrow(
          /не підтверджено/,
        );
      }
    },
  );

  it('keeps the card inquiry-only without an immediate-access promise when enrollment props disagree', () => {
    const $ = render(
      createElement(PackageCard, {
        offering: instagram,
        program: programFor(instagram),
        pack: platinum,
        enrollable: true,
        paymentDisabled: true,
        availableLessons: ['Ще не опублікований урок'],
      }),
    );
    expect($('a[href^="/checkout?"]').length).toBe(0);
    expect($('button').text()).toBe('Уточнити пакет');
    expect($('article').text()).not.toContain('Ще не опублікований урок');
    expect($('article').text()).not.toContain('Отримати доступ');
  });

  it('keeps comparison and package decisions inquiry-only despite stale mapped package IDs', () => {
    const $ = render(
      createElement(ProgramPackages, {
        offering: instagram,
        program: programFor(instagram),
        enrollment: { mode: 'disabled', packageIds: [platinum.id] },
      }),
    );
    expect($(`a[href*="package=${platinum.id}"]`).length).toBe(0);
    const card = $('.package-grid article').filter(
      (_, element) => $(element).find('h3').text() === 'PLATINUM',
    );
    expect(card.find('button').text()).toBe('Уточнити пакет');
    expect($('.comparison-desktop').text()).toContain('За запитом');
  });

  it('ignores a stale comparison purchase URL for an inquiry-only tier', () => {
    const $ = render(
      createElement(PackageComparisonTable, {
        items: [
          {
            ...platinum,
            purchaseUrl: '/checkout?offering=x&package=instagram-platinum',
            statusLabel: 'За запитом',
            inquiryAllowed: true,
          },
        ],
        programTitle: 'Інста, яка продає',
        onClose: () => {},
        onInquire: () => {},
      }),
    );
    expect($('a').length).toBe(0);
    expect($('button[aria-label="Уточнити PLATINUM"]').length).toBe(1);
  });
});

describe('pricing presentation', () => {
  it.each([commercial, visual, instagram])(
    'shows the same authored prices and highlighted GOLD in cards and comparison for $programId',
    (item) => {
      const $ = render(
        createElement(ProgramPackages, { offering: item, program: programFor(item) }),
      );
      const cards = $('.package-grid article');
      expect(cards.length).toBe(3);
      item.packages.forEach((pack, index) => {
        expect(cards.eq(index).find('.price').text()).toContain(money(pack.price));
        expect($('.comparison-desktop .comparison-price').eq(index).text()).toBe(money(pack.price));
      });
      expect(cards.filter('[data-featured="true"]').find('h3').text()).toBe('GOLD');
      expect(cards.filter('[data-featured="true"]').text()).toContain('Найпопулярніший');
      expect($('.comparison-desktop th[scope="col"][data-featured="true"]').text()).toContain(
        'GOLDНайпопулярніший',
      );
      expect(cards.filter('[data-featured="true"]').text()).toContain('Місць немає');
      expect(cards.filter('[data-featured="true"]').find('a,button').length).toBe(0);
      expect($('#comparison-second option[selected]').text()).toBe('GOLD');
    },
  );

  it('uses content metadata, not the package name, to assign the popular label', () => {
    const renderNamedCard = (name: string, featured: boolean) =>
      render(
        createElement(PackageCard, {
          offering: commercial,
          program: programFor(commercial),
          pack: { ...commercial.packages[0], name, featured },
        }),
      );
    expect(renderNamedCard('GOLD', false)('article').text()).not.toContain('Найпопулярніший');
    expect(renderNamedCard('Підтримка', true)('article').text()).toContain('Найпопулярніший');
  });

  it.each([0, 100, 1000])(
    'does not claim a discount when previous price %s is no higher than current',
    (previousPrice) => {
      const $ = render(
        createElement(PackageCard, {
          offering: commercial,
          program: programFor(commercial),
          pack: { ...commercial.packages[0], price: 1000, previousPrice },
        }),
      );
      expect($('.previous-price').length).toBe(0);
    },
  );
});
