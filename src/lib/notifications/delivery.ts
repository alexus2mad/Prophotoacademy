import { randomUUID } from 'node:crypto';
import { databasePool, transaction } from '../database/client';
import type { NotificationJob } from './types';
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
export async function deliverNotifications() {
  const db = databasePool(),
    claim = randomUUID();
  const jobs = await transaction(async (tx) => {
    const selected = await tx.query<NotificationJob>(
      "SELECT * FROM academy.outbox WHERE state='pending' AND next_attempt<=now() AND (claim_until IS NULL OR claim_until<now()) ORDER BY next_attempt LIMIT 20 FOR UPDATE SKIP LOCKED",
    );
    for (const job of selected.rows)
      await tx.query(
        "UPDATE academy.outbox SET claim_token=$1,claim_until=now()+interval '2 minutes' WHERE id=$2",
        [claim, job.id],
      );
    return selected.rows;
  });
  let delivered = 0;
  for (const job of jobs) {
    try {
      const data = job.data;
      if (data.mode === 'mock') {
        await db.query(
          "UPDATE academy.outbox SET state='local',claim_until=NULL WHERE id=$1 AND claim_token=$2",
          [job.id, claim],
        );
        continue;
      }
      if (
        job.kind === 'order-status' &&
        data.customer?.email &&
        ['approved', 'refunded'].includes(data.status || '')
      ) {
        if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
          throw new Error('Email not configured');
        const approved = data.status === 'approved',
          title = approved ? 'Ваш курс уже в кабінеті' : 'Повернення оплати підтверджено';
        const href = new URL(
          '/account',
          process.env.NEXT_PUBLIC_ACADEMY_URL || process.env.NEXT_PUBLIC_SITE_URL!,
        ).href;
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
            'Content-Type': 'application/json',
            'Idempotency-Key': job.id,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [data.customer.email],
            subject: title,
            html: `<h1>${title}</h1><p>${escape(data.programTitle || 'ProPhoto Academy')}</p>${approved ? `<p>Увійдіть за email, який ви вказали під час оформлення.</p><p><a href="${escape(href)}">Перейти до навчання</a></p>` : ''}`,
          }),
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error('Email delivery failed');
      } else if (process.env.MAKE_WEBHOOK_URL) {
        if (!process.env.MAKE_WEBHOOK_URL.startsWith('https://'))
          throw new Error('Invalid notification endpoint');
        const response = await fetch(process.env.MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': job.id },
          body: JSON.stringify({ eventId: job.id, type: job.kind, ...data }),
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error('Notification delivery failed');
      } else {
        await db.query(
          "UPDATE academy.outbox SET state='local',claim_until=NULL WHERE id=$1 AND claim_token=$2",
          [job.id, claim],
        );
        continue;
      }
      await db.query(
        "UPDATE academy.outbox SET state='delivered',claim_until=NULL,last_error=NULL WHERE id=$1 AND claim_token=$2",
        [job.id, claim],
      );
      delivered++;
    } catch {
      await db.query(
        "UPDATE academy.outbox SET attempts=attempts+1,next_attempt=now()+$1*interval '1 second',claim_until=NULL,last_error='Delivery failed; retry scheduled' WHERE id=$2 AND claim_token=$3",
        [Math.min(3600, 30 * 2 ** Math.min(job.attempts, 7)), job.id, claim],
      );
    }
  }
  return { delivered };
}
