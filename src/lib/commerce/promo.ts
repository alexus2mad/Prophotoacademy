import { z } from 'zod';
import { audit, databasePool, managedDatabase, transaction } from '../database/client';
import type { SqlConnection } from '../database/types';
import { HttpError } from '../http';
import type { PromoCode, PromoCodeRow, PromoLookup, PromoQuote } from './types';

const invalid = (message = 'Промокод недійсний') =>
  new HttpError(422, message, { promoCode: message });

// Whole hryvnias, never below the 1 UAH minimum a card payment needs.
export const discountedAmount = (amount: number, percent: number) =>
  Math.max(1, Math.round((amount * (100 - percent)) / 100));

// Paid orders and other buyers' checkouts still within their payment window hold a use.
// A buyer's own unfinished attempt does not, so closing the widget and retrying works.
const usesSql = `SELECT count(*) AS uses FROM academy.orders WHERE data->>'promoCode'=$1
  AND (data->>'status'='approved' OR (data->>'status'='pending'
    AND created_at>now()-interval '30 minutes' AND data->'customer'->>'email'<>$2))`;

export async function quotePromo(
  db: SqlConnection,
  input: PromoLookup,
  now = new Date(),
): Promise<PromoQuote> {
  if (!managedDatabase()) throw invalid('Промокоди тимчасово недоступні');
  const row = (
    await db.query<PromoCodeRow>('SELECT * FROM academy.promo_codes WHERE code=$1', [input.code])
  ).rows[0];
  if (
    !row ||
    !row.active ||
    (row.starts_at && row.starts_at > now) ||
    (row.expires_at && row.expires_at <= now) ||
    (row.program_ids.length && !row.program_ids.includes(input.programId))
  )
    throw invalid();
  if (
    row.max_uses &&
    Number((await db.query(usesSql, [row.code, input.email || ''])).rows[0].uses) >= row.max_uses
  )
    throw invalid('Ліміт використань промокоду вичерпано');
  return {
    code: row.code,
    percent: row.percent,
    amount: discountedAmount(input.amount, row.percent),
  };
}

// Serializes checkouts using one code so a usage limit cannot be overrun.
export async function reservePromo(db: SqlConnection, input: Required<PromoLookup>) {
  await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['promo:' + input.code]);
  return quotePromo(db, input);
}

const toPromo = (row: PromoCodeRow): PromoCode => ({
  code: row.code,
  percent: row.percent,
  active: row.active,
  startsAt: row.starts_at?.toISOString() || null,
  expiresAt: row.expires_at?.toISOString() || null,
  maxUses: row.max_uses,
  programIds: row.program_ids,
  note: row.note,
  uses: Number(row.uses || 0),
});

export async function listPromoCodes() {
  if (!managedDatabase()) return [];
  const rows = await databasePool().query<PromoCodeRow>(
    `SELECT p.*, (SELECT count(*) FROM academy.orders o WHERE o.data->>'promoCode'=p.code
       AND o.data->>'status'='approved') AS uses
     FROM academy.promo_codes p ORDER BY p.active DESC, p.created_at DESC`,
  );
  return rows.rows.map(toPromo);
}

export const promoInput = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,32}$/),
    percent: z.number().int().min(1).max(90),
    active: z.boolean(),
    startsAt: z.iso.datetime({ offset: true }).nullable(),
    expiresAt: z.iso.datetime({ offset: true }).nullable(),
    maxUses: z.number().int().min(1).max(100_000).nullable(),
    programIds: z.array(z.string().min(1).max(100)).max(50),
    note: z.string().trim().max(200),
    // Creating never overwrites an existing code; editing never creates one.
    update: z.boolean(),
  })
  .strict()
  .refine((v) => !v.startsAt || !v.expiresAt || v.expiresAt > v.startsAt, {
    path: ['expiresAt'],
    message: 'Дата завершення має бути пізніше за початок',
  });

export async function savePromoCode(raw: unknown, actorId: string, programIds: string[]) {
  const input = promoInput.parse(raw);
  if (input.programIds.some((id) => !programIds.includes(id)))
    throw new HttpError(400, 'Оберіть програми зі списку');
  return transaction(async (db) => {
    const before = (
      await db.query<PromoCodeRow>('SELECT * FROM academy.promo_codes WHERE code=$1 FOR UPDATE', [
        input.code,
      ])
    ).rows[0];
    if (input.update !== Boolean(before))
      throw new HttpError(409, before ? 'Такий промокод уже існує' : 'Промокод не знайдено');
    const saved = (
      await db.query<PromoCodeRow>(
        `INSERT INTO academy.promo_codes(code,percent,active,starts_at,expires_at,max_uses,program_ids,note,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT(code) DO UPDATE SET percent=excluded.percent,active=excluded.active,
           starts_at=excluded.starts_at,expires_at=excluded.expires_at,max_uses=excluded.max_uses,
           program_ids=excluded.program_ids,note=excluded.note,updated_at=now()
         RETURNING *`,
        [
          input.code,
          input.percent,
          input.active,
          input.startsAt,
          input.expiresAt,
          input.maxUses,
          JSON.stringify(input.programIds),
          input.note,
          actorId,
        ],
      )
    ).rows[0];
    await audit(db, {
      actorId,
      action: before ? 'promo.update' : 'promo.create',
      target: input.code,
      before: before ? toPromo(before) : null,
      after: toPromo(saved),
    });
    return toPromo(saved);
  });
}
