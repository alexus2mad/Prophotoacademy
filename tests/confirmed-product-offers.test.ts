import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { findOffering } from '../src/lib/content/selectors';
import { resolvePurchase } from '../src/lib/checkout';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import { canEnroll } from '../src/lib/format';
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

  it('closes the dated event after its day and preserves the temporary course-sales closure', () => {
    vi.stubEnv('PAYMENT_MODE', 'wayforpay');
    const later = new Date('2026-11-23T10:00:00Z');
    for (const pack of eventOffering.packages) {
      expect(canEnroll(eventOffering, pack, later)).toBe(false);
      expect(() => resolvePurchase(content, eventOffering.id, pack.id, later)).toThrow();
    }
    expect(commercialOffering.startDate).toBe('2026-11-06');
    for (const pack of commercialOffering.packages) {
      expect(canEnroll(commercialOffering, pack, now)).toBe(false);
      expect(() => resolvePurchase(content, commercialOffering.id, pack.id, now)).toThrow(
        'Набір закрито',
      );
    }
    expect(programSchedule(commercial, commercialOffering, now)).toMatchObject({
      status: 'Набір закрито',
      date: '2026-11-06',
      inquirySuggested: true,
    });
  });

  it('keeps the separate Food Photography program inquiry-only', () => {
    const food = content.programs.find((program) => program.slug === 'food-photography')!;
    expect(food).toBeDefined();
    expect(findOffering(content, food.id)).toBeUndefined();
  });
});
