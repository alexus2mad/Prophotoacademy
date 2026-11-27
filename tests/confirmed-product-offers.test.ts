import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { findOffering } from '../src/lib/content/selectors';
import { resolvePurchase } from '../src/lib/checkout';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import { canEnroll, programStatusLabel } from '../src/lib/format';
import { programSchedule } from '../src/lib/program-schedule';
import { studioIntensiveOffer } from '../src/lib/studio-pages/intensive';

const content = fixture as AcademyContent;
const now = new Date('2026-11-11T10:00:00Z');
const event = content.programs.find((program) => program.slug === 'ai-artwork')!;
const eventOffering = findOffering(content, event.id)!;
const commercial = content.programs.find((program) => program.id === 'program-commercial')!;
const commercialOffering = findOffering(content, commercial.id)!;
const enableTimers = vi.useFakeTimers.bind(vi);
const restoreTimers = vi.useRealTimers.bind(vi);

afterEach(() => {
  vi.unstubAllEnvs();
  restoreTimers();
});

describe('owner-confirmed November offers', () => {
  it('keeps the intensive separate from the four main courses', () => {
    expect(content.programs.filter((program) => program.category === 'course')).toHaveLength(4);
    expect(event.category).toBe('class');
    expect(eventOffering).toMatchObject({
      id: 'offering-ai-artwork-2026-11-22',
      startDate: '2026-11-22',
      startTime: '11:00',
      endTime: '16:00',
      timeZone: 'Europe/Kyiv',
      verificationRequired: false,
    });
    expect(
      eventOffering.packages.map((pack) => [pack.id, pack.name, pack.price, pack.kind]),
    ).toEqual([
      ['ai-artwork-offline', 'Офлайн', 3900, 'product'],
      ['ai-artwork-online', 'Онлайн', 3000, 'product'],
    ]);
  });

  it.each(['mock', 'wayforpay'])(
    'resolves both ticket formats through the existing %s checkout',
    (mode) => {
      vi.stubEnv('PAYMENT_MODE', mode);
      for (const pack of eventOffering.packages) {
        const resolved = resolvePurchase(content, eventOffering.id, pack.id, now);
        expect(resolved.program.id).toBe(event.id);
        expect(resolved.pack).toBe(pack);
        expect(resolved.pack.kind).toBe('product');
      }
    },
  );

  it('links each mock format to its own checkout and does not promise a confirmed ticket', async () => {
    enableTimers();
    vi.setSystemTime(now);
    vi.stubEnv('PAYMENT_MODE', 'mock');
    const enrollment = await enrollmentOptions(eventOffering);
    expect(enrollment.packageIds).toEqual(['ai-artwork-offline', 'ai-artwork-online']);
    const offer = studioIntensiveOffer(content, enrollment);
    expect(offer.purchaseNotice).toContain('без оплати й підтвердження участі');
    expect(offer.prices.map((price) => price.purchaseUrl)).toEqual([
      '/checkout?offering=offering-ai-artwork-2026-11-22&package=ai-artwork-offline',
      '/checkout?offering=offering-ai-artwork-2026-11-22&package=ai-artwork-online',
    ]);
  });

  it('closes the dated event after its day and Content Creator while it stays available in recordings', () => {
    vi.stubEnv('PAYMENT_MODE', 'wayforpay');
    const later = new Date('2026-11-23T10:00:00Z');
    for (const pack of eventOffering.packages) {
      expect(canEnroll(eventOffering, pack, later)).toBe(false);
      expect(() => resolvePurchase(content, eventOffering.id, pack.id, later)).toThrow();
    }
    expect(commercialOffering.startDate).toBe('2026-11-27');
    for (const pack of commercialOffering.packages) {
      expect(canEnroll(commercialOffering, pack, now)).toBe(false);
      expect(() => resolvePurchase(content, commercialOffering.id, pack.id, now)).toThrow();
    }
    expect(programSchedule(commercial, commercialOffering, now)).toMatchObject({
      label: 'Старт потоку',
      status: 'Доступно в записі',
      date: '2026-11-27',
      inquirySuggested: true,
    });
    expect(programStatusLabel(commercial, commercialOffering)).toBe('Доступно в записі');
  });

  it.each(['mock', 'wayforpay'])(
    'keeps the three closed Content Creator packages unpurchasable in %s mode with unchanged prices',
    (mode) => {
      vi.stubEnv('PAYMENT_MODE', mode);
      expect(commercialOffering.packages.map((pack) => [pack.id, pack.price])).toEqual([
        ['commercial-base', 9600],
        ['commercial-gold', 29900],
        ['commercial-platinum', 79900],
      ]);
      for (const pack of commercialOffering.packages) {
        expect(() => resolvePurchase(content, commercialOffering.id, pack.id, now)).toThrow(
          'Продаж курсу закрито',
        );
      }
      expect(commercialOffering.packages.find((pack) => pack.featured)?.id).toBe('commercial-gold');
    },
  );

  it('opens the food and product photography course with the confirmed December packages', () => {
    const food = content.programs.find((program) => program.slug === 'food-product-photography')!;
    expect(food.id).toBe('program-food');
    const offering = findOffering(content, food.id)!;
    expect(offering).toMatchObject({
      id: 'offering-food-2026-12',
      startDate: '2026-12-17',
      availability: 'open',
      verificationRequired: false,
    });
    expect(offering.packages.map(({ id, name, price }) => [id, name, price])).toEqual([
      ['food-base', 'BASE', 7900],
      ['food-gold-pro', 'GOLD PRO', 19600],
      ['food-vip-pro', 'VIP PRO', 59999],
    ]);
    expect(offering.packages.find((pack) => pack.featured)?.id).toBe('food-gold-pro');
  });
});
