import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { HttpError } from '../http';
import { databasePool, transaction } from '../database/client';
import { claimIdentity, safeReturnTo } from './identity';
import type { Member } from './types';

export const authConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.DATABASE_URL,
  );
export async function authClient(writable = false) {
  if (!authConfigured()) throw new HttpError(503, 'Кабінет ще налаштовується');
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: writable
          ? (values) => {
              for (const { name, value, options } of values) jar.set(name, value, options);
            }
          : undefined,
      },
    },
  );
}
export function storageClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw new HttpError(503, 'Сховище ще не підключено');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export const currentMember = cache(async () => {
  if (!authConfigured()) return null;
  const client = await authClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user?.email || !user.email_confirmed_at) return null;
  const member = (
    await databasePool().query<Member>('SELECT * FROM academy.profiles WHERE id=$1', [user.id])
  ).rows[0];
  return (
    member ??
    transaction((db) =>
      claimIdentity(
        db,
        { id: user.id, email: user.email!, verifiedAt: user.email_confirmed_at! },
        process.env.BOOTSTRAP_ADMIN_EMAIL || 'alex.maksiutenko@gmail.com',
      ),
    )
  );
});
export async function requireMember() {
  const user = await currentMember();
  if (!user) throw new HttpError(401, 'Увійдіть до кабінету');
  return user;
}
export async function requireAdmin(fresh = false) {
  const user = await requireMember();
  if (user.role !== 'admin') throw new HttpError(403, 'Потрібні права адміністратора');
  if (fresh) {
    const recent = await databasePool().query('SELECT value FROM academy.settings WHERE key=$1', [
      'verified:' + user.id + ':' + (await sessionId()),
    ]);
    if (!recent.rows[0] || Date.now() - Number(recent.rows[0].value) > 600_000)
      throw new HttpError(428, 'Підтвердьте email ще раз для цієї дії');
  }
  return user;
}
export async function sessionId() {
  const { data } = await (await authClient()).auth.getClaims();
  return String(data?.claims.session_id || '');
}
export async function pageMember(destination = '/account', admin = false) {
  const member = await currentMember();
  if (!member) redirect('/login?next=' + encodeURIComponent(safeReturnTo(destination)));
  if (admin && member.role !== 'admin') redirect('/account');
  return member;
}
