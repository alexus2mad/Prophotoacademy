import { describe, it, expect } from 'vitest';
import seed from '../content/academy.json';
import { canEnroll } from '../src/lib/format';
import { resolvePurchase, checkoutInput } from '../src/lib/checkout';
import type { AcademyContent, Offering } from '../src/lib/content/types';
const content = seed as AcademyContent;
describe('enrollment integrity', () => {
  it('does not sell a stale, unverified or sold-out intake', () => {
    for (const offering of content.offerings)
      expect(canEnroll(offering, offering.packages[0], new Date('2026-10-07'))).toBe(false);
    expect(() =>
      resolvePurchase(content, 'offering-commercial-2026-11', 'commercial-base'),
    ).toThrow(/не підтверджено/);
  });
  it('allows only a verified future intake and available package', () => {
    const offering = { ...content.offerings[1], verificationRequired: false } as Offering;
    expect(canEnroll(offering, offering.packages[0], new Date('2026-10-07'))).toBe(true);
    expect(canEnroll(offering, offering.packages[1], new Date('2026-10-07'))).toBe(false);
    expect(canEnroll(offering, offering.packages[0], new Date('2026-11-07'))).toBe(false);
  });
  it('rejects client prices and unsupported checkout fields', () => {
    expect(
      checkoutInput.safeParse({
        offeringId: 'x',
        packageId: 'x',
        name: 'Test',
        email: 'test@example.com',
        phone: '+380630000000',
        consent: true,
        token: 'a'.repeat(64),
        idempotencyKey: 'de74f8aa-c768-4af4-9b43-ebbb3c413fc7',
        amount: 1,
      }).success,
    ).toBe(false);
  });
  it('never exposes demo products in real payment mode', () => {
    process.env.PAYMENT_MODE = 'wayforpay';
    expect(() => resolvePurchase(content, 'demo-offering', 'demo-base')).toThrow();
    process.env.PAYMENT_MODE = 'mock';
    expect(resolvePurchase(content, 'demo-offering', 'demo-base').pack.price).toBe(9600);
  });
  it('requires explicit verification instead of treating a missing flag as confirmed', () => {
    const offering = {
      ...content.offerings[1],
      verificationRequired: undefined,
    } as unknown as Offering;
    expect(canEnroll(offering, offering.packages[0], new Date('2026-10-07'))).toBe(false);
  });
});
