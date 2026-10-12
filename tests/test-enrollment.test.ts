import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import seed from '../content/academy.json';
import { POST as checkout } from '../src/app/api/checkout/route';
import { POST as callback } from '../src/app/api/payments/wayforpay/callback/route';
import { POST as mockPayment } from '../src/app/api/payments/mock/route';
import { GET as orderStatus } from '../src/app/api/orders/status/route';
import { claimIdentity } from '../src/lib/auth/identity';
import { createOrder, purchaseAccess, IdempotencyConflict } from '../src/lib/commerce/orders';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import { transaction } from '../src/lib/database/client';
import { paymentMode } from '../src/lib/commerce/payment-mode';
import type { SqlConnection } from '../src/lib/database/types';
import type { OrderRow } from './types';
import type { AcademyContent } from '../src/lib/content/types';

const pg = new PGlite();
const sql: SqlConnection = {
  query: async (text, values) => {
    const result = await pg.query(text, values);
    return { ...result, rowCount: result.affectedRows || result.rows.length } as never;
  },
};
const content = structuredClone(seed) as AcademyContent;
const offering = content.offerings.find((o) => o.programId === 'program-instagram')!;
const origin = 'https://academy.example';
const payload = () => ({
  offeringId: offering.id,
  packageId: 'instagram-base',
  name: 'Test learner',
  email: 'guest@example.test',
  phone: '+380630000000',
  consent: true,
  token: randomUUID().replaceAll('-', '').repeat(2),
  idempotencyKey: randomUUID(),
});
const request = (body: unknown, path = '/api/checkout') =>
  new Request(origin + path, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
const count = async (table: string) =>
  (await pg.query(`SELECT * FROM academy.${table}`)).rows.length;
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
  await pg.exec(await readFile('supabase/migrations/202610090001_learning.sql', 'utf8'));
  await pg.exec(await readFile('supabase/migrations/202610120001_test_enrollment.sql', 'utf8'));
  await pg.exec(`INSERT INTO academy.courses(id,program_id,title,active_release_id) VALUES('course','program-instagram','Test course','release');
    INSERT INTO academy.releases(id,course_id,version,manifest) VALUES('release','course',1,'{"modules":[{"lessons":[{"id":"lesson"}]}]}');`);
});
beforeEach(async () => {
  vi.stubEnv('DATABASE_URL', 'postgresql://test.invalid');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', origin);
  vi.stubEnv('PAYMENT_MODE', 'disabled');
  vi.stubEnv('TRUST_PROXY', '0');
  await pg.exec(
    'TRUNCATE academy.profiles,academy.grants,academy.orders,academy.transactions,academy.payment_events,academy.outbox,academy.audit,academy.rate_limits,academy.package_rules CASCADE',
  );
  await pg.query(
    `INSERT INTO academy.package_rules(offering_id,package_id,course_id,release_id,lesson_ids,access_months)
    VALUES($1,'instagram-base','course','release','["lesson"]',5)`,
    [offering.id],
  );
});
afterAll(async () => {
  await pg.close();
  vi.unstubAllEnvs();
});

describe('explicit payment-disabled checkout', () => {
  it('grants a guest access atomically once, normalizes email and creates no financial records', async () => {
    const input = { ...payload(), email: '  GUEST@example.test  ' };
    const results = await Promise.all([checkout(request(input)), checkout(request(input))]);
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(await results[0].json()).toEqual(await results[1].json());
    const order = (await pg.query<OrderRow>('SELECT data FROM academy.orders')).rows[0].data;
    expect(order).toMatchObject({
      mode: 'disabled',
      status: 'enrolled',
      amount: 0,
      listAmount: 4200,
      customer: { email: 'guest@example.test' },
    });
    expect(await count('grants')).toBe(1);
    expect(await count('outbox')).toBe(1);
    expect(await count('transactions')).toBe(0);
    expect(await count('payment_events')).toBe(0);
    const status = await orderStatus(
      new Request(origin + '/api/orders/status?token=' + input.token),
    );
    expect(await status.json()).toMatchObject({ status: 'enrolled', learningAccess: true });
    const userId = randomUUID();
    await transaction((db) =>
      claimIdentity(
        db,
        { id: userId, email: 'guest@example.test', verifiedAt: new Date().toISOString() },
        'admin@example.test',
      ),
    );
    expect((await pg.query('SELECT user_id,source FROM academy.grants')).rows[0]).toEqual({
      user_id: userId,
      source: 'test',
    });
  });
  it('cannot renew or restore a revoked grant by retrying or using a new checkout key', async () => {
    const input = payload();
    expect((await checkout(request(input))).status).toBe(200);
    await pg.exec('UPDATE academy.grants SET revoked_at=now()');
    expect((await checkout(request(input))).status).toBe(200);
    expect((await checkout(request(payload()))).status).toBe(409);
    expect(await count('orders')).toBe(1);
    expect(await count('grants')).toBe(1);
    const status = await orderStatus(
      new Request(origin + '/api/orders/status?token=' + input.token),
    );
    expect(await status.json()).toMatchObject({ learningAccess: false });
  });
  it('links an already verified buyer immediately without claiming another account', async () => {
    const buyer = randomUUID(),
      other = randomUUID();
    for (const [id, email] of [
      [buyer, 'guest@example.test'],
      [other, 'other@example.test'],
    ])
      await transaction((db) =>
        claimIdentity(
          db,
          { id, email, verifiedAt: new Date().toISOString() },
          'admin@example.test',
        ),
      );
    expect((await checkout(request(payload()))).status).toBe(200);
    expect((await pg.query('SELECT user_id FROM academy.grants')).rows).toEqual([
      { user_id: buyer },
    ]);
  });
  it('rejects unmapped, closed and mismatched packages and client-controlled payment fields', async () => {
    expect((await enrollmentOptions(offering)).packageIds).toEqual(['instagram-base']);
    expect((await checkout(request({ ...payload(), packageId: 'instagram-expert' }))).status).toBe(
      409,
    );
    for (const extra of [{ mode: 'disabled' }, { amount: 0 }, { fulfillment: {} }])
      expect((await checkout(request({ ...payload(), ...extra }))).status).toBe(400);
    await expect(purchaseAccess(offering.id, 'instagram-base', 'wrong-program')).rejects.toThrow(
      'готуються',
    );
    await pg.exec('DELETE FROM academy.package_rules');
    expect((await checkout(request(payload()))).status).toBe(409);
    expect(await count('orders')).toBe(0);
  });
  it('rolls the whole enrollment back if its outbox cannot be saved', async () => {
    await pg.exec(`CREATE FUNCTION academy.reject_outbox() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'test failure'; END; $$ LANGUAGE plpgsql;
      CREATE TRIGGER reject_outbox BEFORE INSERT ON academy.outbox FOR EACH ROW EXECUTE FUNCTION academy.reject_outbox();`);
    try {
      expect((await checkout(request(payload()))).status).toBe(500);
      expect(await count('orders')).toBe(0);
      expect(await count('grants')).toBe(0);
    } finally {
      await pg.exec(
        'DROP TRIGGER reject_outbox ON academy.outbox; DROP FUNCTION academy.reject_outbox()',
      );
    }
  });
  it('does not accept simulated or provider callbacks in disabled mode, or silently bypass missing services', async () => {
    expect((await mockPayment(request({}))).status).toBe(404);
    expect((await callback(request({}))).status).toBe(404);
    vi.stubEnv('DATABASE_URL', '');
    expect((await checkout(request(payload()))).status).toBe(503);
    vi.stubEnv('PAYMENT_MODE', 'typo');
    expect(() => paymentMode()).toThrow('не налаштований');
  });
  it('keeps live payment mode fail-closed and never upgrades a test order into a paid order', async () => {
    const input = payload();
    await checkout(request(input));
    const order = (await pg.query<OrderRow>('SELECT data FROM academy.orders')).rows[0].data;
    vi.stubEnv('PAYMENT_MODE', 'wayforpay');
    vi.stubEnv('WAYFORPAY_MERCHANT_ACCOUNT', '');
    const open = structuredClone(offering);
    Object.assign(offering, {
      verificationRequired: false,
      availability: 'open',
      startDate: undefined,
    });
    offering.packages[0].availability = 'open';
    try {
      expect((await checkout(request(input))).status).toBe(409);
      expect((await checkout(request(payload()))).status).toBe(503);
      await expect(createOrder({ ...order, mode: 'wayforpay' }, input.token)).rejects.toThrow(
        IdempotencyConflict,
      );
      expect(await count('transactions')).toBe(0);
    } finally {
      Object.assign(offering, open);
    }
  });
});
