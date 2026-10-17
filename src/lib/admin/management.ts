import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { verifyManagementSignature } from './signature';
import { hash } from '../ledger';
import { HttpError } from '../http';
import { consumeRateLimit, databasePool, transaction } from '../database/client';
import { claimIdentity, changeAdministrator, normalizeEmail } from '../auth/identity';
import { adminOverview, adminPeople, adminPerson, adminTeam, sessionRoster } from './queries';
import { manageAccess } from './access';
import { recordAttendance } from '../learning/live';
import { customerAccounts } from './customer-account';
import type { ManagementMember } from './types';

const managementSessionSeconds = 90 * 24 * 60 * 60;

export async function acceptManagementRequest(body: string, headers: Headers) {
  const nonce = verifyManagementSignature(
    body,
    headers,
    process.env.PS_BOOKING_MANAGEMENT_SECRET || '',
  );
  const db = databasePool();
  await db.query(
    "DELETE FROM academy.management_nonces WHERE created_at<now()-interval '10 minutes'",
  );
  const used = await db.query(
    'INSERT INTO academy.management_nonces(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id',
    [nonce],
  );
  if (!used.rowCount) throw new HttpError(409, 'Replayed management request');
  return z
    .object({
      action: z.string().min(1).max(50),
      session: z.string().max(128).optional(),
      value: z.unknown().optional(),
    })
    .parse(JSON.parse(body));
}
async function managementMember(token: string | undefined, fresh = false) {
  if (!token) throw new HttpError(401, 'Підтвердьте email адміністратора');
  const result = await databasePool().query<ManagementMember>(
    `UPDATE academy.management_sessions s
     SET expires_at=GREATEST(s.expires_at,now()+$2 * interval '1 second')
     FROM academy.profiles p
     WHERE p.id=s.user_id AND s.token_hash=$1 AND s.expires_at>now() AND p.role='admin'
     RETURNING p.*,s.verified_at AS session_verified_at`,
    [hash(token), managementSessionSeconds],
  );
  const member = result.rows[0];
  if (!member) throw new HttpError(401, 'Сеанс завершився або права змінено');
  if (fresh && Date.now() - new Date(member.session_verified_at).getTime() > 600000)
    throw new HttpError(428, 'Підтвердьте email ще раз для зміни прав');
  return member;
}
export async function managementAction(action: string, value: unknown, session?: string) {
  if (action === 'auth.send' || action === 'auth.verify') {
    const input = z
        .object({
          email: z.string().trim().toLowerCase().pipe(z.email()),
          code: z
            .string()
            .regex(/^\d{6,10}$/)
            .optional(),
        })
        .parse(value),
      email = normalizeEmail(input.email);
    if (
      !(await consumeRateLimit(
        'management:' + action + ':' + email,
        action === 'auth.send' ? 3 : 10,
        600,
      ))
    )
      throw new HttpError(429, 'Спробуйте пізніше');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new HttpError(503, 'Email-вхід ще не підключено');
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (action === 'auth.send') {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw new HttpError(429, 'Не вдалося надіслати код');
      return { sent: true };
    }
    if (!input.code) throw new HttpError(400, 'Введіть код');
    const { data, error } = await client.auth.verifyOtp({
      email,
      token: input.code,
      type: 'email',
    });
    if (
      error ||
      !data.user?.email_confirmed_at ||
      !data.user.email ||
      normalizeEmail(data.user.email) !== email
    )
      throw new HttpError(401, 'Код недійсний або застарів');
    const user = data.user;
    const member = await transaction((db) =>
      claimIdentity(
        db,
        { id: user.id, email: user.email!, verifiedAt: user.email_confirmed_at! },
        process.env.BOOTSTRAP_ADMIN_EMAIL || 'alex.maksiutenko@gmail.com',
      ),
    );
    if (member.role !== 'admin') throw new HttpError(403, 'Потрібні права адміністратора Академії');
    const token = randomBytes(32).toString('hex');
    await databasePool().query(
      "INSERT INTO academy.management_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+$3 * interval '1 second')",
      [hash(token), member.id, managementSessionSeconds],
    );
    return {
      token,
      user: { id: member.id, email: member.email, name: member.name },
      expiresIn: managementSessionSeconds,
    };
  }
  const actor = await managementMember(session, action === 'team.change');
  if (action === 'auth.session')
    return {
      user: { id: actor.id, email: actor.email, name: actor.name },
      expiresIn: managementSessionSeconds,
    };
  if (action === 'auth.logout') {
    await databasePool().query('DELETE FROM academy.management_sessions WHERE token_hash=$1', [
      hash(session!),
    ]);
    return { ok: true };
  }
  if (action === 'overview') return adminOverview();
  if (action === 'customer.summary') {
    const input = z
      .object({ emails: z.array(z.string().trim().toLowerCase().pipe(z.email())).min(1).max(20) })
      .parse(value);
    return { accounts: await customerAccounts(databasePool(), input.emails) };
  }
  if (action === 'people') {
    const input = z.object({ q: z.string().max(100).optional() }).parse(value || {});
    return { people: await adminPeople(input.q) };
  }
  if (action === 'person') {
    const input = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) }).parse(value);
    return adminPerson(input.email);
  }
  if (action === 'team') return adminTeam();
  if (action === 'roster') {
    const input = z.object({ sessionId: z.uuid() }).parse(value);
    return { people: await sessionRoster(input.sessionId) };
  }
  if (action === 'team.change') {
    const input = z
      .object({
        email: z.string().trim().toLowerCase().pipe(z.email()),
        grant: z.boolean(),
        reason: z.string().trim().min(3).max(1000),
      })
      .parse(value);
    await transaction((db) =>
      changeAdministrator(db, actor.id, input.email, input.grant, input.reason),
    );
    return { ok: true };
  }
  if (action === 'access.change') return manageAccess(value, actor.id);
  if (action === 'attendance') {
    const input = z
      .object({
        sessionId: z.uuid(),
        userIds: z.array(z.uuid()).min(1).max(500),
        attended: z.boolean().default(true),
      })
      .parse(value);
    await recordAttendance(input.sessionId, input.userIds, actor.id, input.attended);
    return { ok: true };
  }
  throw new HttpError(404, 'Невідома дія');
}
