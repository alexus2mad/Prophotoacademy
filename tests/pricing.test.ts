import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import seed from '../content/academy.json';
import type { AcademyContent, Offering } from '../src/lib/content/types';
import { resolvePurchase } from '../src/lib/checkout';
import { canEnroll, money } from '../src/lib/format';
import { canTestEnroll } from '../src/lib/commerce/selectors';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import * as database from '../src/lib/database/client';
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
if (!platinum) throw new Error('Missing Instagram PLATINUM');
const inquiryPackage = { ...platinum, inquiryOnly: true };
const inquiryOffering = {
  ...instagram,
  packages: instagram.packages.map((pack) =>
    pack.id === inquiryPackage.id ? inquiryPackage : pack,
  ),
};
const prices = [
  [commercial.id, 'commercial-base', 9600],
  [commercial.id, 'commercial-gold', 29900],
  [commercial.id, 'commercial-platinum', 79900],
  [visual.id, 'visual-base', 7500],
  [visual.id, 'visual-gold', 25500],
  [visual.id, 'visual-platinum', 63900],
  [instagram.id, 'instagram-base', 4200],
  [instagram.id, 'instagram-expert', 11900],
  [instagram.id, 'instagram-platinum', 29900],
] as const;

beforeEach(() => {
  // Register Date for restoration while mocking only the calendar, not timers.
  vi.stubGlobal('Date', Date);
  vi.setSystemTime(purchaseDate);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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
    expect(item).toMatchObject({ availability: 'open', verificationRequired: false });
    expect(item.packages.every((pack) => pack.availability === 'open' && !pack.inquiryOnly)).toBe(
      true,
    );
  });

  describe.each(['mock', 'wayforpay'])('%s checkout', (mode) => {
    it.each(prices)(
      'resolves new orders from the current price source: %s / %s',
      (id, packageId, expected) => {
        vi.stubEnv('PAYMENT_MODE', mode);
        expect(resolvePurchase(content, id, packageId, purchaseDate).pack.price).toBe(expected);
      },
    );
  });

  it('renames the existing Instagram expert tier without replacing its identity or promises', () => {
    const gold = instagram.packages.find((pack) => pack.id === 'instagram-expert');
    expect(gold).toMatchObject({
      name: 'GOLD',
      availability: 'open',
      description: 'Робота над власним експертним брендом',
      includes: ['18 лекцій', 'Чат та індивідуальна робота', 'Доступ назавжди'],
    });
    expect(gold?.previousPrice).toBeUndefined();
    expect(platinum).toMatchObject({ availability: 'open', includes: [] });
    expect(platinum.inquiryOnly).toBeUndefined();
  });

  it.each(['mock', 'wayforpay', 'disabled'])(
    'still refuses an explicitly closed package in %s mode',
    (mode) => {
      vi.stubEnv('PAYMENT_MODE', mode);
      for (const availability of ['soldOut', 'archived'] as const) {
        const pack = { ...platinum, availability };
        const intake = { ...instagram, packages: [pack] };
        expect(() =>
          resolvePurchase({ ...content, offerings: [intake] }, intake.id, pack.id, purchaseDate),
        ).toThrow(/не підтверджено/);
      }
    },
  );
});

describe('mock catalog enrollment', () => {
  it.each(['', 'postgresql://unused.invalid'])(
    'offers all nine course tiers without reading a database (DATABASE_URL=%s)',
    async (databaseUrl) => {
      vi.stubEnv('PAYMENT_MODE', 'mock');
      vi.stubEnv('DATABASE_URL', databaseUrl);
      const pool = vi.spyOn(database, 'databasePool').mockImplementation(() => {
        throw new Error('Mock enrollment must not read the database');
      });
      for (const intake of [commercial, visual, instagram]) {
        expect(await enrollmentOptions(intake)).toEqual({
          mode: 'mock',
          packageIds: intake.packages.map((pack) => pack.id),
        });
      }
      expect(pool).not.toHaveBeenCalled();
    },
  );

  it('excludes closed, inquiry-only and non-course packages from mock checkout', async () => {
    vi.stubEnv('PAYMENT_MODE', 'mock');
    vi.stubEnv('DATABASE_URL', '');
    const intake: Offering = {
      ...instagram,
      packages: [
        platinum,
        ...(['soldOut', 'waitlist', 'archived'] as const).map((availability) => ({
          ...platinum,
          id: `unavailable-${availability}`,
          availability,
        })),
        { ...inquiryPackage, id: 'inquiry-only' },
        { ...platinum, id: 'ticket', kind: 'product' },
      ],
    };
    expect((await enrollmentOptions(intake)).packageIds).toEqual([platinum.id]);
  });

  it('honors intake availability and verification in mock mode', async () => {
    vi.stubEnv('PAYMENT_MODE', 'mock');
    vi.stubEnv('DATABASE_URL', '');
    const candidates: Offering[] = [
      ...(['soldOut', 'waitlist', 'archived'] as const).map((availability) => ({
        ...instagram,
        availability,
      })),
      { ...instagram, verificationRequired: true },
      { ...instagram, startDate: '2020-01-01', openAfterStart: false },
    ];
    for (const intake of candidates)
      expect((await enrollmentOptions(intake)).packageIds).toEqual([]);
    expect(await enrollmentOptions()).toEqual({ mode: 'mock', packageIds: [] });
  });
});

describe('inquiry-only package boundaries', () => {
  it.each(['mock', 'wayforpay', 'disabled'])(
    'rejects checkout in %s mode even if availability is changed to open',
    (mode) => {
      vi.stubEnv('PAYMENT_MODE', mode);
      for (const availability of ['waitlist', 'open'] as const) {
        const pack = { ...inquiryPackage, availability };
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
        offering: inquiryOffering,
        program: programFor(instagram),
        pack: inquiryPackage,
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
        offering: inquiryOffering,
        program: programFor(instagram),
        enrollment: { mode: 'disabled', packageIds: [inquiryPackage.id] },
      }),
    );
    expect($(`a[href*="package=${inquiryPackage.id}"]`).length).toBe(0);
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
            ...inquiryPackage,
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
    'shows buyable mock tiers with authored prices and highlighted GOLD for $programId',
    async (item) => {
      vi.stubEnv('PAYMENT_MODE', 'mock');
      vi.stubEnv('DATABASE_URL', '');
      const $ = render(
        createElement(ProgramPackages, {
          offering: item,
          program: programFor(item),
          enrollment: await enrollmentOptions(item),
        }),
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
      expect(cards.find('button').length).toBe(0);
      expect(cards.find('a[href^="/checkout?"]').length).toBe(3);
      expect($('.package-source-note').text()).toBe(
        'Тестове оформлення — без оплати й доступу до навчання',
      );
      expect(cards.text()).not.toContain('Отримати доступ');
      item.packages.forEach((pack, index) => {
        const checkoutUrl = `/checkout?offering=${item.id}&package=${pack.id}`;
        expect(cards.eq(index).find('a').attr('href')).toBe(checkoutUrl);
        expect($('.comparison-desktop').find(`a[href="${checkoutUrl}"]`).length).toBe(1);
      });
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
