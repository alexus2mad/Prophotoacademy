import { cookies } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { HttpError } from '@/lib/http';
import { databasePool } from '@/lib/database/client';
import { safeReturnTo } from '@/lib/auth/identity';
import { rpc } from './rpc';
import type { Member } from '@/lib/auth/types';
import type { SandboxSession, SandboxUser, SandboxEmailInput, SandboxCodeInput } from './types';

export const authConfigured = () => true;
export function createSandboxAuthClient(...options: unknown[]) {
  void options;
  return {
    auth: {
      async signInWithOtp(input: SandboxEmailInput) {
        await rpc('auth.send', input);
        return { error: null };
      },
      async verifyOtp(input: SandboxCodeInput) {
        const result = await rpc<SandboxSession>('auth.verify', {
          email: input.email,
          code: input.token,
        });
        return {
          error: null,
          data: { user: result.user, session: { access_token: result.token } },
        };
      },
    },
  };
}
export async function authClient(writable = false) {
  const jar = await cookies(),
    cookieName = 'prophoto_sandbox_auth',
    client = createSandboxAuthClient();
  return {
    auth: {
      ...client.auth,
      async verifyOtp(input: SandboxCodeInput) {
        const result = await client.auth.verifyOtp(input);
        if (writable)
          jar.set(cookieName, result.data.session.access_token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 86400,
          });
        return result;
      },
      async getUser() {
        const user = await rpc<SandboxUser | null>('auth.user', {
          token: jar.get(cookieName)?.value,
        });
        return { error: null, data: { user } };
      },
      async getClaims(token?: string) {
        return { data: { claims: { session_id: token || jar.get(cookieName)?.value || '' } } };
      },
      async signOut(...options: unknown[]) {
        void options;
        if (writable) jar.delete(cookieName);
        return { error: null };
      },
    },
  };
}
export const currentMember = cache(async () => {
  const { data } = await (await authClient()).auth.getUser();
  if (!data.user) return null;
  return (
    (
      await databasePool().query<Member>('SELECT * FROM academy.profiles WHERE id=$1', [
        data.user.id,
      ])
    ).rows[0] || null
  );
});
export async function requireMember() {
  const user = await currentMember();
  if (!user) throw new HttpError(401, 'Увійдіть до тестового кабінету');
  return user;
}
export async function requireAdmin(fresh = false) {
  const user = await requireMember();
  if (user.role !== 'admin') throw new HttpError(403, 'Потрібні права адміністратора');
  if (fresh) {
    const value = (
      await databasePool().query('SELECT value FROM academy.settings WHERE key=$1', [
        'verified:' + user.id + ':' + (await sessionId()),
      ])
    ).rows[0]?.value;
    if (!value || Date.now() - Number(value) > 600000)
      throw new HttpError(428, 'Підтвердьте email ще раз');
  }
  return user;
}
export async function sessionId() {
  return (await (await authClient()).auth.getClaims()).data.claims.session_id;
}
export async function pageMember(destination = '/account', admin = false) {
  const member = await currentMember();
  if (!member) redirect('/login?next=' + encodeURIComponent(safeReturnTo(destination)));
  if (admin && member.role !== 'admin') redirect('/account');
  return member;
}
