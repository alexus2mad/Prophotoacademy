import { audit } from '../database/client';
import type { SqlConnection } from '../database/types';
import type { Order } from '../ledger/types';
import { accessDates } from '../learning/access';
import { HttpError } from '../http';

export async function grantOrderAccess(db: SqlConnection, order: Order) {
  if (!order.fulfillment) throw new HttpError(409, 'Навчальні матеріали пакета ще готуються');
  const email = order.customer.email.trim().toLowerCase();
  // Serialize with verified identity claiming, including a guest signing in during checkout.
  await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['identity:' + email]);
  const snapshot = order.fulfillment;
  const dates = accessDates(new Date().toISOString(), snapshot.accessMonths, snapshot.startsAt);
  await db.query(
    `INSERT INTO academy.grants(user_id,email,course_id,release_id,lesson_ids,package_name,source_order_id,source,starts_at,expires_at,offering_id,reason)
     VALUES((SELECT id FROM academy.profiles WHERE email=$1),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT(source_order_id) DO NOTHING`,
    [
      email,
      snapshot.courseId,
      snapshot.releaseId,
      JSON.stringify(snapshot.lessonIds),
      order.packageName,
      order.id,
      order.mode === 'disabled' ? 'test' : 'purchase',
      dates.startsAt,
      dates.expiresAt,
      order.offeringId,
      order.mode === 'disabled' ? 'Тестовий запис без оплати' : null,
    ],
  );
}

export async function enrollWithoutPayment(db: SqlConnection, order: Order) {
  if (order.mode !== 'disabled' || order.status !== 'pending' || order.amount !== 0)
    throw new HttpError(409, 'Неприпустимий тестовий запис');
  // A new browser token must not renew access or undo a manager's revocation.
  const key = ['test-enrollment', order.customer.email, order.offeringId, order.packageId].join(
    ':',
  );
  await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [key]);
  const previous = await db.query(
    `SELECT id FROM academy.orders WHERE id<>$1 AND data->>'mode'='disabled'
     AND data->>'status'='enrolled' AND data->'customer'->>'email'=$2
     AND data->>'offeringId'=$3 AND data->>'packageId'=$4 LIMIT 1`,
    [order.id, order.customer.email, order.offeringId, order.packageId],
  );
  if (previous.rowCount)
    throw new HttpError(
      409,
      'Цей пакет уже оформлено на ваш email. Увійдіть до кабінету. Якщо доступ завершився або його скасовано, зверніться до академії',
    );
  await grantOrderAccess(db, order);
  order.status = 'enrolled';
  await db.query('UPDATE academy.orders SET data=$1 WHERE id=$2', [
    JSON.stringify(order),
    order.id,
  ]);
  await db.query("INSERT INTO academy.outbox(id,kind,data) VALUES($1,'enrollment',$2)", [
    order.id + ':enrolled',
    JSON.stringify(order),
  ]);
  await audit(db, {
    action: 'enrollment.test',
    target: order.id,
    reason: 'Payment explicitly disabled; no financial transaction',
    after: { courseId: order.fulfillment!.courseId, packageId: order.packageId },
  });
  return order;
}
