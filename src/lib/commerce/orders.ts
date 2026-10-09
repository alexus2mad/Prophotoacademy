import { randomUUID } from 'node:crypto';
import * as local from '../ledger';
import { databasePool, managedDatabase, transaction } from '../database/client';
import type { SqlConnection, JsonRow } from '../database/types';
import type { Order, OrderStatus } from '../ledger/types';
import type { AccessSnapshot } from '../learning/types';
import { accessDates } from '../learning/access';
import { HttpError } from '../http';
export { hash, IdempotencyConflict } from '../ledger';

function requireBackend() {
  if (!managedDatabase() && process.env.PAYMENT_MODE === 'wayforpay')
    throw new HttpError(503, 'Платіжний кабінет ще не підключено');
}
export async function orderById(id: string) {
  requireBackend();
  return managedDatabase()
    ? (
        await databasePool().query<JsonRow<Order>>('SELECT data FROM academy.orders WHERE id=$1', [
          id,
        ])
      ).rows[0]?.data
    : local.orderById(id);
}
export async function orderByToken(token: string) {
  requireBackend();
  return managedDatabase()
    ? (
        await databasePool().query<JsonRow<Order>>(
          'SELECT data FROM academy.orders WHERE token_hash=$1',
          [local.hash(token)],
        )
      ).rows[0]?.data
    : local.orderByToken(token);
}
export async function orderByKey(key: string) {
  requireBackend();
  return managedDatabase()
    ? (
        await databasePool().query<JsonRow<Order>>(
          'SELECT data FROM academy.orders WHERE idempotency_key=$1',
          [key],
        )
      ).rows[0]?.data
    : local.orderByKey(key);
}
export async function purchaseAccess(offeringId: string, packageId: string) {
  if (!managedDatabase()) return undefined;
  const rule = (
    await databasePool().query(
      'SELECT * FROM academy.package_rules WHERE offering_id=$1 AND package_id=$2',
      [offeringId, packageId],
    )
  ).rows[0];
  if (!rule) throw new HttpError(409, 'Навчальні матеріали цього пакета ще готуються');
  return {
    courseId: rule.course_id,
    releaseId: rule.release_id,
    lessonIds: rule.lesson_ids,
    accessMonths: rule.access_months,
    startsAt: rule.starts_at?.toISOString() || null,
  } as AccessSnapshot;
}
export async function createOrder(
  data: Omit<Order, 'id' | 'tokenHash' | 'createdAt' | 'status'>,
  token: string,
) {
  requireBackend();
  if (!managedDatabase()) return local.createOrder(data, token);
  return transaction(async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [data.idempotencyKey]);
    const old = (
      await db.query<JsonRow<Order>>('SELECT data FROM academy.orders WHERE idempotency_key=$1', [
        data.idempotencyKey,
      ])
    ).rows[0]?.data;
    if (old) {
      if (
        old.fingerprint !== data.fingerprint ||
        old.tokenHash !== local.hash(token) ||
        old.mode !== data.mode
      )
        throw new local.IdempotencyConflict();
      return old;
    }
    const order: Order = {
      ...data,
      id: 'ppa-' + randomUUID(),
      tokenHash: local.hash(token),
      createdAt: Math.floor(Date.now() / 1000),
      status: 'pending',
    };
    await db.query(
      'INSERT INTO academy.orders(id,token_hash,idempotency_key,fingerprint,data) VALUES($1,$2,$3,$4,$5)',
      [order.id, order.tokenHash, order.idempotencyKey, order.fingerprint, JSON.stringify(order)],
    );
    return order;
  });
}
export async function fulfillOrder(
  db: SqlConnection,
  order: Order,
  status: OrderStatus,
  merchant: string,
) {
  if (order.mode !== 'wayforpay') return;
  const paidAt = new Date().toISOString();
  const amount = Math.round(order.amount * 100),
    email = order.customer.email.trim().toLowerCase();
  const tx = (
    await db.query(
      "INSERT INTO academy.transactions(merchant,reference,business,order_id,email,customer_name,product_title,program_id,package_id,amount_minor,currency,status,paid_at) VALUES($1,$2,'academy',$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $10='approved' THEN now() ELSE NULL END) ON CONFLICT(merchant,reference) DO UPDATE SET status=excluded.status,paid_at=coalesce(academy.transactions.paid_at,excluded.paid_at),synced_at=now() RETURNING id",
      [
        merchant,
        order.id,
        email,
        order.customer.name,
        order.programTitle,
        order.programId,
        order.packageId,
        amount,
        order.currency,
        status,
      ],
    )
  ).rows[0];
  await db.query(
    'INSERT INTO academy.payment_events(id,transaction_id,status) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
    [merchant + ':' + order.id + ':' + status, tx.id, status],
  );
  if (status === 'approved' && order.fulfillment) {
    const snapshot = order.fulfillment,
      dates = accessDates(paidAt, snapshot.accessMonths, snapshot.startsAt);
    await db.query(
      "INSERT INTO academy.grants(user_id,email,course_id,release_id,lesson_ids,package_name,source_order_id,source,starts_at,expires_at,offering_id) VALUES((SELECT id FROM academy.profiles WHERE email=$1),$1,$2,$3,$4,$5,$6,'purchase',$7,$8,$9) ON CONFLICT(source_order_id) DO NOTHING",
      [
        email,
        snapshot.courseId,
        snapshot.releaseId,
        JSON.stringify(snapshot.lessonIds),
        order.packageName,
        order.id,
        dates.startsAt,
        dates.expiresAt,
        order.offeringId,
      ],
    );
  }
  if (status === 'refunded') {
    await db.query('UPDATE academy.transactions SET refunded_minor=amount_minor WHERE id=$1', [
      tx.id,
    ]);
    await db.query(
      "UPDATE academy.grants SET revoked_at=coalesce(revoked_at,now()),reason='Повне повернення оплати' WHERE source_order_id=$1",
      [order.id],
    );
  }
}
export async function updateOrder(
  id: string,
  status: OrderStatus,
  merchant = process.env.WAYFORPAY_MERCHANT_ACCOUNT || '',
) {
  requireBackend();
  if (!managedDatabase()) return local.updateOrder(id, status);
  return transaction(async (db) => {
    const order = (
      await db.query<JsonRow<Order>>('SELECT data FROM academy.orders WHERE id=$1 FOR UPDATE', [id])
    ).rows[0]?.data;
    if (!order) throw new HttpError(404, 'Замовлення не знайдено');
    const allowed =
      (order.status === 'pending' && status !== 'refunded') ||
      (order.status === 'approved' && status === 'refunded');
    if (order.status !== status && allowed) {
      order.status = status;
      await db.query('UPDATE academy.orders SET data=$1 WHERE id=$2', [JSON.stringify(order), id]);
      await fulfillOrder(db, order, status, merchant);
      await db.query(
        'INSERT INTO academy.outbox(id,kind,data) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [id + ':' + status, 'order-status', JSON.stringify({ ...order, orderId: id })],
      );
    }
    return order;
  });
}
export async function saveInquiry(data: unknown) {
  if (!managedDatabase()) return local.saveInquiry(data);
  return transaction(async (db) => {
    const id = randomUUID();
    await db.query('INSERT INTO academy.inquiries(id,data) VALUES($1,$2)', [
      id,
      JSON.stringify(data),
    ]);
    await db.query("INSERT INTO academy.outbox(id,kind,data) VALUES($1,'inquiry',$2)", [
      id,
      JSON.stringify(data),
    ]);
    return id;
  });
}
