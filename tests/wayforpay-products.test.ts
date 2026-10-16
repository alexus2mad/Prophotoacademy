import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import seed from '../content/academy.json';
import { POST as checkout } from '../src/app/api/checkout/route';
import { POST as promoPreview } from '../src/app/api/checkout/promo/route';
import { POST as widgetEvent } from '../src/app/api/checkout/events/route';
import { POST as callback } from '../src/app/api/payments/wayforpay/callback/route';
import { GET as orderStatus } from '../src/app/api/orders/status/route';
import { savePromoCode, discountedAmount } from '../src/lib/commerce/promo';
import { resolvePurchase, testProduct } from '../src/lib/checkout';
import { sign } from '../src/lib/wayforpay';
import type { SqlConnection } from '../src/lib/database/types';
import type { OrderRow, OutboxEventRow } from './types';
import type { AcademyContent } from '../src/lib/content/types';

const pg = new PGlite();
const sql: SqlConnection = {
  query: async (text, values) => {
    const result = await pg.query(text, values);
    return { ...result, rowCount: result.affectedRows || result.rows.length } as never;
  },
};
const content = structuredClone(seed) as AcademyContent;
// A ticketed event like Pro Photo Lab: products need no curriculum mapping.
content.offerings.push({
  id: 'offering-lab-next',
  programId: 'program-lab',
  startDate: '2099-09-26',
  duration: '1 день',
  format: 'hybrid',
  availability: 'open',
  verificationRequired: false,
  packages: [
    {
      id: 'ticket-online',
      name: 'Квиток Online',
      kind: 'product',
      price: 900,
      availability: 'open',
      description: 'Трансляція',
      includes: [],
    },
  ],
});
const origin = 'https://academy.example';
const secret = 'test-secret-not-a-credential';
const admin = randomUUID();
const lab = ['program-lab'];
const payload = (extra: Record<string, unknown> = {}) => ({
  offeringId: 'offering-lab-next',
  packageId: 'ticket-online',
  name: 'Олена Тестова',
  email: 'buyer@example.test',
  phone: '+380630000000',
  telegram: '@buyer_tg',
  instagram: 'buyer.ig',
  consent: true,
  token: randomUUID().replaceAll('-', '').repeat(2),
  idempotencyKey: randomUUID(),
  ...extra,
});
const post = (path: string, body: unknown) =>
  new Request(origin + path, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
const events = async () =>
  (
    await pg.query<OutboxEventRow>(
      "SELECT * FROM academy.outbox WHERE kind='payment-event' ORDER BY id",
    )
  ).rows;
const order = async () =>
  (await pg.query<OrderRow>('SELECT data FROM academy.orders')).rows[0].data;
function providerCallback(reference: string, amount: number) {
  const data = {
    merchantAccount: 'test-merchant',
    orderReference: reference,
    amount,
    currency: 'UAH',
    authCode: '123',
    cardPan: '41****1111',
    transactionStatus: 'Approved',
    reasonCode: 1100,
    cardType: 'Visa',
    paymentSystem: 'card',
    fee: 0.02,
  };
  const signed = [
    data.merchantAccount,
    data.orderReference,
    data.amount,
    data.currency,
    data.authCode,
    data.cardPan,
    data.transactionStatus,
    data.reasonCode,
  ];
  return { ...data, merchantSignature: sign(signed, secret) };
}
const promo = (code: string, extra: Record<string, unknown> = {}) => ({
  code,
  percent: 10,
  active: true,
  startsAt: null,
  expiresAt: null,
  maxUses: null,
  programIds: [],
  note: '',
  update: false,
  ...extra,
});
vi.mock('@/lib/content', () => ({ getContent: async () => content }));
vi.mock('../src/lib/database/client', async (load) => ({
  ...(await load<typeof import('../src/lib/database/client')>()),
  consumeRateLimit: async () => true,
  managedDatabase: () => Boolean(process.env.DATABASE_URL),
  databasePool: () => sql,
  transaction: async (work: (db: SqlConnection) => Promise<unknown>) =>
    pg.transaction(async (tx) =>
      work({
        query: async (text, values) => {
          const r = await tx.query(text, values);
          return { ...r, rowCount: r.affectedRows || r.rows.length } as never;
        },
      }),
    ),
}));
beforeAll(async () => {
  for (const file of [
    '202610090001_learning.sql',
    '202610120001_test_enrollment.sql',
    '202610170001_promo_codes.sql',
  ])
    await pg.exec(await readFile('supabase/migrations/' + file, 'utf8'));
});
beforeEach(async () => {
  vi.stubEnv('DATABASE_URL', 'postgresql://test.invalid');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', origin);
  vi.stubEnv('PAYMENT_MODE', 'wayforpay');
  vi.stubEnv('WAYFORPAY_MERCHANT_ACCOUNT', 'test-merchant');
  vi.stubEnv('WAYFORPAY_MERCHANT_SECRET', secret);
  vi.stubEnv('WAYFORPAY_MERCHANT_DOMAIN', 'academy.example');
  vi.stubEnv('TRUST_PROXY', '0');
  await pg.exec(
    'TRUNCATE academy.profiles,academy.grants,academy.orders,academy.transactions,academy.payment_events,academy.outbox,academy.audit,academy.promo_codes CASCADE',
  );
  await pg.query(
    "INSERT INTO academy.profiles(id,email,role,verified_at) VALUES($1,'admin@example.test','admin',now())",
    [admin],
  );
});
afterAll(async () => {
  await pg.close();
  vi.unstubAllEnvs();
});

describe('ticket and service products', () => {
  it('sells a ticket without a curriculum mapping and never grants learning access', async () => {
    const input = payload();
    const response = await checkout(post('/api/checkout', input));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.fields).toMatchObject({
      amount: 900,
      authorizationType: 'SimpleSignature',
      clientFirstName: 'Олена',
      clientLastName: 'Тестова',
      serviceUrl: origin + '/api/payments/wayforpay/callback',
    });
    expect(await order()).toMatchObject({
      productKind: 'product',
      amount: 900,
      customer: { telegram: 'buyer_tg', instagram: 'buyer.ig' },
    });
    expect((await order()).fulfillment).toBeUndefined();
    const paid = await callback(
      post('/api/payments/wayforpay/callback', providerCallback(body.orderId, 900)),
    );
    expect(paid.status).toBe(200);
    expect((await pg.query('SELECT * FROM academy.grants')).rows).toHaveLength(0);
    expect((await pg.query('SELECT status FROM academy.transactions')).rows).toEqual([
      { status: 'approved' },
    ]);
    const status = await orderStatus(
      new Request(origin + '/api/orders/status?token=' + input.token),
    );
    expect(await status.json()).toMatchObject({
      status: 'approved',
      productKind: 'product',
      learningAccess: false,
    });
  });
  it('sends the original site Make.com events from stored order data', async () => {
    const response = await checkout(post('/api/checkout', payload()));
    const { orderId } = await response.json();
    await callback(post('/api/payments/wayforpay/callback', providerCallback(orderId, 900)));
    const queued = await events();
    expect(queued.map((e) => e.data.event)).toEqual(['payment_start', 'payment_success_server']);
    expect(queued[1].data).toMatchObject({
      orderReference: orderId,
      amount: 900,
      cardType: 'Visa',
      transactionStatus: 'Approved',
      formData: {
        name: 'Олена Тестова',
        telegram: 'buyer_tg',
        instagram: 'buyer.ig',
        promocode: '',
        email: 'buyer@example.test',
      },
      productData: { id: 'ticket-online', type: 'ticket', price: '900 грн' },
    });
  });
  it('records widget outcomes for Make.com without changing the order', async () => {
    const input = payload();
    await checkout(post('/api/checkout', input));
    for (const event of ['approved', 'approved', 'pending']) {
      const response = await widgetEvent(
        post('/api/checkout/events', { token: input.token, event }),
      );
      expect(response.status).toBe(200);
    }
    expect((await events()).map((e) => e.data.event).sort()).toEqual([
      'payment_approved',
      'payment_pending',
      'payment_start',
    ]);
    expect((await order()).status).toBe('pending');
    const unknown = await widgetEvent(
      post('/api/checkout/events', { token: 'c'.repeat(64), event: 'approved' }),
    );
    expect(unknown.status).toBe(404);
  });
  it('offers the hidden 1 UAH test payment only in paid mode', async () => {
    const { pack } = resolvePurchase(content, testProduct.offeringId, testProduct.packageId);
    expect(pack).toMatchObject({ price: 1, kind: 'product' });
    const response = await checkout(
      post('/api/checkout', payload({ offeringId: 'test-payment', packageId: 'test-1uah' })),
    );
    expect((await response.json()).fields.amount).toBe(1);
    vi.stubEnv('PAYMENT_MODE', 'disabled');
    expect(() => resolvePurchase(content, testProduct.offeringId, testProduct.packageId)).toThrow();
  });
  it('does not test-enroll products while payments are disabled', async () => {
    vi.stubEnv('PAYMENT_MODE', 'disabled');
    expect((await checkout(post('/api/checkout', payload()))).status).toBe(409);
  });
});

describe('promo codes', () => {
  it('applies a manager code on the server and keeps the list price on the order', async () => {
    await savePromoCode(promo('LAB10'), admin, lab);
    const preview = await promoPreview(
      post('/api/checkout/promo', {
        offeringId: 'offering-lab-next',
        packageId: 'ticket-online',
        promoCode: 'lab10',
      }),
    );
    expect(await preview.json()).toEqual({
      code: 'LAB10',
      percent: 10,
      amount: 810,
      listAmount: 900,
    });
    const response = await checkout(post('/api/checkout', payload({ promoCode: 'lab10' })));
    const body = await response.json();
    expect(body.fields.amount).toBe(810);
    expect(body.fields.productPrice).toEqual([810]);
    expect(await order()).toMatchObject({
      amount: 810,
      listAmount: 900,
      promoCode: 'LAB10',
      discountPercent: 10,
    });
    expect((await events())[0].data).toMatchObject({
      formData: { promocode: 'LAB10' },
      productData: { originalPrice: '900 грн', price: '810 грн', discountApplied: true },
    });
    expect((await pg.query("SELECT action FROM academy.audit WHERE target='LAB10'")).rows).toEqual([
      { action: 'promo.create' },
    ]);
  });
  it('rejects unknown, inactive, expired, future and out-of-scope codes with a field error', async () => {
    await savePromoCode(promo('OFF', { active: false }), admin, lab);
    await savePromoCode(promo('OLD', { expiresAt: '2020-01-01T00:00:00Z' }), admin, lab);
    await savePromoCode(promo('SOON', { startsAt: '2098-01-01T00:00:00Z' }), admin, lab);
    await savePromoCode(promo('OTHER', { programIds: ['program-visual'] }), admin, [
      ...lab,
      'program-visual',
    ]);
    for (const code of ['NOPE', 'OFF', 'OLD', 'SOON', 'OTHER']) {
      const response = await checkout(post('/api/checkout', payload({ promoCode: code })));
      expect(response.status).toBe(422);
      expect((await response.json()).fieldErrors.promoCode).toBeTruthy();
    }
    expect((await pg.query('SELECT * FROM academy.orders')).rows).toHaveLength(0);
  });
  it('enforces usage limits across buyers but lets a buyer retry an abandoned checkout', async () => {
    await savePromoCode(promo('ONCE', { maxUses: 1 }), admin, lab);
    expect((await checkout(post('/api/checkout', payload({ promoCode: 'ONCE' })))).status).toBe(
      200,
    );
    expect((await checkout(post('/api/checkout', payload({ promoCode: 'ONCE' })))).status).toBe(
      200,
    );
    const other = await checkout(
      post('/api/checkout', payload({ promoCode: 'ONCE', email: 'other@example.test' })),
    );
    expect(other.status).toBe(422);
    expect((await other.json()).fieldErrors.promoCode).toBe(
      'Ліміт використань промокоду вичерпано',
    );
  });
  it('never overwrites a code on create, never creates one on edit, and caps the discount', async () => {
    await savePromoCode(promo('KEEP'), admin, lab);
    await expect(savePromoCode(promo('KEEP', { percent: 50 }), admin, lab)).rejects.toThrow(
      'Такий промокод уже існує',
    );
    await expect(savePromoCode(promo('GHOST', { update: true }), admin, lab)).rejects.toThrow(
      'Промокод не знайдено',
    );
    await expect(savePromoCode(promo('BIG', { percent: 100 }), admin, lab)).rejects.toThrow();
    expect(discountedAmount(1, 90)).toBe(1);
    expect(discountedAmount(7500, 5)).toBe(7125);
  });
  it('is unavailable outside paid mode', async () => {
    vi.stubEnv('PAYMENT_MODE', 'disabled');
    const response = await promoPreview(
      post('/api/checkout/promo', {
        offeringId: 'offering-lab-next',
        packageId: 'ticket-online',
        promoCode: 'ANY1',
      }),
    );
    expect(response.status).toBe(422);
  });
});
