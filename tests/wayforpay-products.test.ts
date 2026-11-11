import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import seed from '../content/academy.json';
import { POST as checkout } from '../src/app/api/checkout/route';
import { POST as promoPreview } from '../src/app/api/checkout/promo/route';
import { POST as widgetEvent } from '../src/app/api/checkout/events/route';
import { POST as callback } from '../src/app/api/payments/wayforpay/callback/route';
import { POST as simulatePayment } from '../src/app/api/payments/mock/route';
import { GET as orderStatus } from '../src/app/api/orders/status/route';
import { savePromoCode, discountedAmount, deletePromoCode } from '../src/lib/commerce/promo';
import { resolvePurchase, testProduct } from '../src/lib/checkout';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import { deliverNotifications } from '../src/lib/notifications/delivery';
import { canEnroll } from '../src/lib/format';
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
    '202610170002_promo_code_delete.sql',
  ])
    await pg.exec(await readFile('supabase/migrations/' + file, 'utf8'));
});
beforeEach(async () => {
  // Payment mechanics remain independent of the live course-sales closure.
  for (const offering of content.offerings)
    if (offering.availability === 'closed') offering.availability = 'open';
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
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('ticket and service products', () => {
  it('previews eligible tickets in mock mode without payments, receipts or learning access', async () => {
    vi.stubEnv('PAYMENT_MODE', 'mock');
    const offering = content.offerings.find((item) => item.id === 'offering-lab-next')!;
    expect(await enrollmentOptions(offering)).toEqual({
      mode: 'mock',
      packageIds: ['ticket-online'],
    });
    const input = payload();
    const response = await checkout(post('/api/checkout', input));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result).toMatchObject({ mode: 'mock', url: `/thanks?token=${input.token}` });
    expect(result.fields).toBeUndefined();
    expect((await checkout(post('/api/checkout', input))).status).toBe(200);
    expect((await pg.query('SELECT id FROM academy.orders')).rows).toHaveLength(1);
    const simulated = await simulatePayment(
      post('/api/payments/mock', { token: input.token, status: 'approved' }),
    );
    expect(simulated.status).toBe(200);
    expect((await order()).status).toBe('approved');
    for (const table of ['grants', 'transactions', 'payment_events']) {
      expect((await pg.query(`SELECT * FROM academy.${table}`)).rows).toHaveLength(0);
    }
    expect(await events()).toHaveLength(0);
    expect(await deliverNotifications()).toEqual({ delivered: 0 });
    expect((await pg.query('SELECT state FROM academy.outbox')).rows).toEqual([{ state: 'local' }]);
    const status = await orderStatus(
      new Request(origin + '/api/orders/status?token=' + input.token),
    );
    expect(await status.json()).toMatchObject({
      mode: 'mock',
      productKind: 'product',
      learningAccess: false,
    });
  });
  it('keeps unavailable tickets out of mock checkout', async () => {
    vi.stubEnv('PAYMENT_MODE', 'mock');
    const offering = structuredClone(
      content.offerings.find((item) => item.id === 'offering-lab-next')!,
    );
    offering.packages[0].availability = 'soldOut';
    expect((await enrollmentOptions(offering)).packageIds).toEqual([]);
    offering.packages[0].availability = 'open';
    offering.verificationRequired = true;
    expect((await enrollmentOptions(offering)).packageIds).toEqual([]);
    offering.verificationRequired = false;
    offering.startDate = '2000-01-01';
    expect((await enrollmentOptions(offering)).packageIds).toEqual([]);
  });
  it('never lets mock controls alter a real payment order', async () => {
    const input = payload();
    expect((await checkout(post('/api/checkout', input))).status).toBe(200);
    expect(
      (
        await simulatePayment(
          post('/api/payments/mock', { token: input.token, status: 'approved' }),
        )
      ).status,
    ).toBe(404);
    vi.stubEnv('PAYMENT_MODE', 'mock');
    expect(
      (
        await simulatePayment(
          post('/api/payments/mock', { token: input.token, status: 'approved' }),
        )
      ).status,
    ).toBe(404);
    expect((await order()).status).toBe('pending');
    expect((await pg.query('SELECT * FROM academy.transactions')).rows).toHaveLength(0);
  });
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
  it('accepts provider callbacks sent without a JSON content type', async () => {
    for (const encode of [(body: string) => body, (body: string) => encodeURIComponent(body)]) {
      await pg.exec(
        'TRUNCATE academy.orders,academy.transactions,academy.payment_events,academy.outbox CASCADE',
      );
      const { orderId } = await (await checkout(post('/api/checkout', payload()))).json();
      const response = await callback(
        new Request(origin + '/api/payments/wayforpay/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encode(JSON.stringify(providerCallback(orderId, 900))),
        }),
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ orderReference: orderId, status: 'accept' });
      expect((await order()).status).toBe('approved');
    }
  });
  it('sends the original site Make.com events from stored order data', async () => {
    const response = await checkout(post('/api/checkout', payload()));
    const { orderId } = await response.json();
    await callback(post('/api/payments/wayforpay/callback', providerCallback(orderId, 900)));
    const queued = await events();
    expect(queued.map((e) => e.data.event)).toEqual(['payment_start', 'payment_success']);
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
  it.each([
    ['offering-ai-artwork-2026-11-22', 'ai-artwork-offline', 'ticket', 3900],
    ['offering-ai-artwork-2026-11-22', 'ai-artwork-online', 'ticket', 3000],
    ['offering-visual-2026-03', 'visual-base', 'course', 7500],
  ] as const)(
    'delivers %s / %s through the existing Make notification contract with stable retries',
    async (offeringId, packageId, type, amount) => {
      // Synthetic timing keeps this provider-contract test independent of event expiry.
      if (type === 'ticket')
        content.offerings.find((offering) => offering.id === offeringId)!.startDate = '2099-11-22';
      vi.stubEnv('MAKE_WEBHOOK_URL', 'https://make.example.test/payment-notices');
      vi.stubEnv('RESEND_API_KEY', 'synthetic-email-key');
      vi.stubEnv('EMAIL_FROM', 'Academy <test@example.test>');
      let successAttempts = 0;
      const send = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const data = JSON.parse(String(init?.body));
        if (String(url) === process.env.MAKE_WEBHOOK_URL && data.event === 'payment_success') {
          successAttempts++;
          if (successAttempts === 1) return Response.json({}, { status: 503 });
        }
        return Response.json({ id: 'synthetic-delivery' });
      });
      vi.stubGlobal('fetch', send);
      const input = payload({ offeringId, packageId });
      const first = await checkout(post('/api/checkout', input));
      const { orderId } = await first.json();
      expect(first.status).toBe(200);
      expect((await checkout(post('/api/checkout', input))).status).toBe(200);
      for (let attempt = 0; attempt < 2; attempt++)
        expect(
          (
            await callback(
              post('/api/payments/wayforpay/callback', providerCallback(orderId, amount)),
            )
          ).status,
        ).toBe(200);
      expect((await events()).map((event) => event.data.event)).toEqual([
        'payment_start',
        'payment_success',
      ]);

      await deliverNotifications();
      expect(
        (
          await pg.query('SELECT state,attempts FROM academy.outbox WHERE id=$1', [
            `${orderId}:payment_success`,
          ])
        ).rows,
      ).toEqual([{ state: 'pending', attempts: 1 }]);
      await pg.query(
        "UPDATE academy.outbox SET next_attempt=now()-interval '1 second' WHERE id=$1",
        [`${orderId}:payment_success`],
      );
      expect(await deliverNotifications()).toEqual({ delivered: 1 });
      expect(await deliverNotifications()).toEqual({ delivered: 0 });
      const notifications = send.mock.calls.filter(
        ([url]) => String(url) === process.env.MAKE_WEBHOOK_URL,
      );
      expect(notifications).toHaveLength(3);
      for (const [, init] of notifications) {
        const data = JSON.parse(String(init?.body));
        expect(init?.headers).toMatchObject({ 'Idempotency-Key': `${orderId}:${data.event}` });
        expect(data).toMatchObject({
          eventId: `${orderId}:${data.event}`,
          type: 'payment-event',
          mode: 'wayforpay',
          orderReference: orderId,
          amount,
          currency: 'UAH',
          formData: { email: 'buyer@example.test', telegram: 'buyer_tg', instagram: 'buyer.ig' },
          productData: { id: packageId, type, amount: String(amount), price: `${amount} грн` },
        });
      }
      expect(
        (await pg.query("SELECT state FROM academy.outbox WHERE kind='payment-event'")).rows,
      ).toEqual([{ state: 'delivered' }, { state: 'delivered' }]);
    },
  );
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

describe('courses sold like the original site', () => {
  const visual = () => content.offerings.find((o) => o.id === 'offering-visual-2026-03')!;
  it('rejects new checkout and promo attempts after closure but honors an already issued payment', async () => {
    const input = payload({ offeringId: visual().id, packageId: 'visual-base' });
    const response = await checkout(post('/api/checkout', input));
    expect(response.status).toBe(200);
    const { orderId, amount } = await response.json();
    visual().availability = 'closed';
    expect(
      (
        await checkout(
          post(
            '/api/checkout',
            payload({
              offeringId: visual().id,
              packageId: 'visual-base',
            }),
          ),
        )
      ).status,
    ).toBe(409);
    const quote = await promoPreview(
      post('/api/checkout/promo', {
        offeringId: visual().id,
        packageId: 'visual-base',
        promoCode: 'VALID10',
      }),
    );
    expect(quote.status).toBe(409);
    expect(JSON.stringify(await quote.json())).toContain('Набір закрито');
    const confirmation = await callback(
      post('/api/payments/wayforpay/callback', providerCallback(orderId, amount)),
    );
    expect(confirmation.status).toBe(200);
    expect((await order()).status).toBe('approved');
    expect((await pg.query('SELECT * FROM academy.orders')).rows).toHaveLength(1);
    expect((await pg.query('SELECT * FROM academy.transactions')).rows).toHaveLength(1);
  });
  it('keeps recorded intakes on sale after their start date only when marked', () => {
    const after = new Date('2027-01-15T12:00:00Z');
    expect(canEnroll(visual(), visual().packages[0], after)).toBe(true);
    expect(canEnroll({ ...visual(), openAfterStart: false }, visual().packages[0], after)).toBe(
      false,
    );
    expect(
      canEnroll(
        visual(),
        visual().packages.find((p) => p.id === 'visual-gold'),
      ),
    ).toBe(true);
  });
  it('sells a paid course package without mapped lessons for the team to open', async () => {
    const options = await enrollmentOptions(visual());
    expect(options.packageIds).toEqual(['visual-base', 'visual-gold', 'visual-platinum']);
    const input = payload({ offeringId: 'offering-visual-2026-03', packageId: 'visual-platinum' });
    const response = await checkout(post('/api/checkout', input));
    expect(response.status).toBe(200);
    const { orderId, fields } = await response.json();
    expect(fields.amount).toBe(63900);
    expect(await order()).toMatchObject({ productKind: 'course', amount: 63900 });
    expect((await order()).fulfillment).toBeUndefined();
    await callback(post('/api/payments/wayforpay/callback', providerCallback(orderId, 63900)));
    expect((await order()).status).toBe('approved');
    expect((await pg.query('SELECT * FROM academy.grants')).rows).toHaveLength(0);
    expect((await events()).map((e) => e.data.event)).toEqual(['payment_start', 'payment_success']);
    const status = await orderStatus(
      new Request(origin + '/api/orders/status?token=' + input.token),
    );
    expect(await status.json()).toMatchObject({ status: 'approved', learningAccess: false });
  });
  it('still requires mapped lessons for zero-charge test enrollment', async () => {
    vi.stubEnv('PAYMENT_MODE', 'disabled');
    expect((await enrollmentOptions(visual())).packageIds).toEqual([]);
    const response = await checkout(
      post(
        '/api/checkout',
        payload({ offeringId: 'offering-visual-2026-03', packageId: 'visual-platinum' }),
      ),
    );
    expect(response.status).toBe(409);
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
    expect(discountedAmount(29999, 5)).toBe(28499);
  });
  it('deletes unused codes and only deactivates codes that orders mention', async () => {
    await savePromoCode(promo('SPARE'), admin, lab);
    await savePromoCode(promo('USED'), admin, lab);
    expect((await checkout(post('/api/checkout', payload({ promoCode: 'USED' })))).status).toBe(
      200,
    );
    await expect(deletePromoCode({ code: 'spare' }, admin)).resolves.toEqual({ code: 'SPARE' });
    await expect(deletePromoCode({ code: 'USED' }, admin)).rejects.toThrow('можна лише вимкнути');
    await expect(deletePromoCode({ code: 'GHOST' }, admin)).rejects.toThrow('не знайдено');
    expect((await pg.query('SELECT code FROM academy.promo_codes ORDER BY code')).rows).toEqual([
      { code: 'USED' },
    ]);
    expect(
      (await pg.query("SELECT action FROM academy.audit WHERE target='SPARE' ORDER BY action"))
        .rows,
    ).toEqual([{ action: 'promo.create' }, { action: 'promo.delete' }]);
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
