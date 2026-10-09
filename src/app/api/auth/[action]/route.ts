import { z } from 'zod';
import { authClient, requireMember } from '@/lib/auth/server';
import { normalizeEmail, safeReturnTo, claimIdentity } from '@/lib/auth/identity';
import { consumeRateLimit, databasePool, transaction } from '@/lib/database/client';
import { errorResponse, guardMutation, HttpError, jsonBody } from '@/lib/http';
import type { ActionRouteProps } from '@/app/types';
const inputSchema = z.object({
  email: z.email(),
  code: z
    .string()
    .regex(/^\d{6,10}$/)
    .optional(),
  next: z.string().optional(),
});
export async function POST(request: Request, { params }: ActionRouteProps) {
  try {
    await guardMutation(request, 'auth');
    const { action } = await params;
    const client = await authClient(true);
    if (action === 'logout') {
      await client.auth.signOut();
      return Response.json({ ok: true });
    }
    const input = inputSchema.parse(await jsonBody(request));
    const email = normalizeEmail(input.email);
    if (!(await consumeRateLimit('auth:' + action + ':' + email, action === 'send' ? 3 : 10, 600)))
      throw new HttpError(429, 'Спробуйте пізніше');
    if (action === 'send') {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw new HttpError(429, 'Не вдалося надіслати код. Спробуйте пізніше');
      return Response.json({ ok: true });
    }
    if (action === 'verify' && input.code) {
      const { data, error } = await client.auth.verifyOtp({
        email,
        token: input.code,
        type: 'email',
      });
      if (error || !data.user?.email_confirmed_at || !data.session)
        throw new HttpError(400, 'Код недійсний або застарів');
      await transaction((db) =>
        claimIdentity(
          db,
          { id: data.user!.id, email, verifiedAt: data.user!.email_confirmed_at! },
          process.env.BOOTSTRAP_ADMIN_EMAIL || 'alex.maksiutenko@gmail.com',
        ),
      );
      const { data: claims } = await client.auth.getClaims(data.session.access_token);
      const key = 'verified:' + data.user.id + ':' + String(claims?.claims.session_id || '');
      await databasePool().query(
        'INSERT INTO academy.settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        [key, JSON.stringify(Date.now())],
      );
      return Response.json({ ok: true, redirect: safeReturnTo(input.next) });
    }
    if (action === 'profile') {
      const user = await requireMember();
      return Response.json({ id: user.id, email: user.email });
    }
    throw new HttpError(404, 'Не знайдено');
  } catch (error) {
    return errorResponse(error);
  }
}
