import type { CookieOptions } from '@supabase/ssr';

// Supabase rotates the short-lived access token. The device cookie must outlive it.
export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 400 * 24 * 60 * 60,
  };
}

export function isAccountPage(path: string) {
  return /^\/(account|login|learn|admin)(\/|$)/.test(path);
}

export function needsSessionRefresh(path: string) {
  return (
    isAccountPage(path) ||
    path === '/checkout' ||
    path === '/api/checkout' ||
    /^\/api\/(auth|admin|learning)(\/|$)/.test(path)
  );
}
