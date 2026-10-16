import { acquisitionSchema } from './acquisition-schema';
import { z } from 'zod';
import type { AcademyContent, Offering, Package, Program } from './content/types';
import { canEnroll } from './format';
import { HttpError } from './http';
import { paymentMode } from './commerce/payment-mode';
import { canTestEnroll } from './commerce/selectors';
export const checkoutInput = z
  .object({
    acquisition: acquisitionSchema.optional(),
    offeringId: z.string().min(1).max(100),
    packageId: z.string().min(1).max(100),
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().pipe(z.email().max(160)),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{9,24}$/),
    // Optional contacts the academy uses to reach buyers, as on the original site.
    telegram: z
      .string()
      .trim()
      .regex(/^(@?[A-Za-z0-9_.]{1,64})?$/)
      .optional(),
    instagram: z
      .string()
      .trim()
      .regex(/^(@?[A-Za-z0-9_.]{1,64})?$/)
      .optional(),
    promoCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^([A-Z0-9_-]{3,32})?$/)
      .optional(),
    consent: z.literal(true),
    token: z.string().regex(/^[a-f0-9]{64}$/),
    idempotencyKey: z.uuid(),
  })
  .strict();
const demoProgram = {
  id: 'demo-program',
  title: 'Демонстрація оформлення',
  shortTitle: 'Демонстрація оформлення',
  imageId: 'visual',
} as Program;
const demoPackage: Package = {
  id: 'demo-base',
  name: 'BASE · демо',
  price: 9600,
  availability: 'open',
  description: 'Лише перевірка локального процесу',
  includes: [],
};
const demoOffering: Offering = {
  id: 'demo-offering',
  programId: 'demo-program',
  duration: 'Демонстрація',
  format: 'online',
  availability: 'open',
  verificationRequired: false,
  packages: [demoPackage],
};
// A real 1 UAH charge that verifies the merchant, callback and receipts end to end.
// It is reachable only by direct link and never grants learning access.
export const testProduct = { offeringId: 'test-payment', packageId: 'test-1uah' };
const testProgram = {
  id: 'program-test-payment',
  title: 'Тестова оплата',
  shortTitle: 'Тестова оплата',
  imageId: 'visual',
} as Program;
const testPackage: Package = {
  id: testProduct.packageId,
  name: 'Перевірка оплати · 1 грн',
  kind: 'product',
  price: 1,
  availability: 'open',
  description: 'Службовий платіж для перевірки WayForPay. Доступу до навчання не надає',
  includes: [],
};
const testOffering: Offering = {
  id: testProduct.offeringId,
  programId: testProgram.id,
  duration: 'Разовий платіж',
  format: 'online',
  availability: 'open',
  verificationRequired: false,
  packages: [testPackage],
};
export function resolvePurchase(
  content: AcademyContent,
  offeringId: string,
  packageId: string,
  now = new Date(),
) {
  if (offeringId === 'demo-offering' && packageId === 'demo-base' && paymentMode() === 'mock')
    return { program: demoProgram, offering: demoOffering, pack: demoPackage };
  if (offeringId === testProduct.offeringId && packageId === testProduct.packageId) {
    if (paymentMode() !== 'wayforpay') throw new HttpError(404, 'Пакет не знайдено.');
    return { program: testProgram, offering: testOffering, pack: testPackage };
  }
  const offering = content.offerings.find((o) => o.id === offeringId);
  const pack = offering?.packages.find((p) => p.id === packageId);
  const program = content.programs.find((p) => p.id === offering?.programId);
  if (!offering || !pack || !program) throw new HttpError(404, 'Пакет не знайдено.');
  if (
    !(paymentMode() === 'disabled' ? canTestEnroll(offering, pack) : canEnroll(offering, pack, now))
  )
    throw new HttpError(409, 'Набір у цей пакет не підтверджено. Залиште заявку академії.');
  return { program, offering, pack };
}
