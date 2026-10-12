import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createChunks, combineChunks, createServerClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { proxy } from '../src/proxy';
import { sessionCookieOptions } from '../src/lib/auth/session';

const storageKey = 'sb-session-test-auth-token';
const user = {
  id: '00000000-0000-4000-8000-000000000123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'student@example.test',
  email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
};
function session(expired = true): Session {
  return {
    access_token: 'synthetic-access-token',
    refresh_token: expired ? 'synthetic-old-refresh' : 'synthetic-new-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + (expired ? -120 : 3600),
    user,
  };
}
function request(path: string, value = session()) {
  const encoded = 'base64-' + Buffer.from(JSON.stringify(value)).toString('base64url');
  return new NextRequest('https://academy.example' + path, {
    headers: {
      cookie: createChunks(storageKey, encoded)
        .map(({ name, value }) => `${name}=${value}`)
        .join('; '),
    },
  });
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://session-test.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-publishable-key');
  vi.stubEnv('PROPHOTO_SITE', 'academy');
  vi.stubEnv('NODE_ENV', 'production');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('persistent device sessions with the real Supabase SSR client', () => {
  it.each([
    '/account',
    '/admin/courses',
    '/learn/course/lesson',
    '/checkout',
    '/api/auth/profile',
    '/api/admin/courses/course',
    '/api/learning/course/lesson/progress',
    '/api/learning/course/lesson/media/file',
    '/api/learning/course/lesson/calendar',
    '/api/checkout',
  ])('persists expired-token renewal on %s before the handler reads it', async (path) => {
    const send = vi.fn(async (url: string) =>
      Response.json(url.includes('/token?') ? session(false) : user),
    );
    vi.stubGlobal('fetch', send);
    const incoming = request(path);
    const response = await proxy(incoming);
    const stored = response.cookies.get(storageKey)!;
    expect(stored).toMatchObject({ httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
    expect(stored.maxAge).toBe(400 * 86400);
    const saved = JSON.parse(Buffer.from(stored.value.slice(7), 'base64url').toString());
    expect(saved.refresh_token).toBe('synthetic-new-refresh');
    expect(incoming.cookies.get(storageKey)?.value).toBe(stored.value);
    expect(response.headers.get('x-middleware-request-cookie')).toContain(stored.value);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');

    // A later request from this device uses the persisted session, not another OTP/refresh.
    send.mockClear();
    await proxy(request('/account', saved));
    expect(send.mock.calls.some(([url]) => url.includes('/token?'))).toBe(false);
  });

  it('removes obsolete cookie chunks when a large session shrinks during refresh', async () => {
    const old = session();
    old.user = { ...user, user_metadata: { synthetic: 'x'.repeat(6000) } };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => Response.json(url.includes('/token?') ? session(false) : user)),
    );
    const incoming = request('/api/admin/courses/course', old);
    expect(incoming.cookies.getAll().length).toBeGreaterThan(1);
    const response = await proxy(incoming);
    expect(response.cookies.get(storageKey + '.0')?.maxAge).toBe(0);
    expect(response.cookies.get(storageKey)?.value).toBeTruthy();
    const value = await combineChunks(storageKey, (name) => incoming.cookies.get(name)?.value);
    expect(JSON.parse(Buffer.from(value!.slice(7), 'base64url').toString()).refresh_token).toBe(
      'synthetic-new-refresh',
    );
  });

  it('clears a revoked refresh token instead of renewing access', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' },
          { status: 400 },
        ),
      ),
    );
    const incoming = request('/account');
    const response = await proxy(incoming);
    expect(response.cookies.get(storageKey)).toMatchObject({ value: '', maxAge: 0 });
  });

  it('keeps machine callbacks, public pages and static assets outside cookie refresh', async () => {
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    for (const path of [
      '/',
      '/visual-content',
      '/images/photo.jpg',
      '/api/health',
      '/api/integrations/ps-booking',
      '/api/payments/callback',
      '/api/administrator',
    ])
      await proxy(request(path));
    expect(send).not.toHaveBeenCalled();
  });

  it('signing out this device clears its persistent cookies and uses local revocation', async () => {
    const incoming = request('/api/auth/logout', session(false));
    const send = vi.fn(async (_url: string) => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', send);
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookieOptions: sessionCookieOptions(),
        cookies: {
          getAll: () => incoming.cookies.getAll(),
          setAll: (values) => {
            for (const { name, value, options } of values) {
              expect(options.maxAge).toBe(0);
              incoming.cookies.set(name, value);
            }
          },
        },
      },
    );
    const { error } = await client.auth.signOut({ scope: 'local' });
    expect(error).toBeNull();
    expect(send.mock.calls[0]?.[0]).toContain('/logout?scope=local');
    expect(incoming.cookies.get(storageKey)?.value).toBe('');
  });
});
