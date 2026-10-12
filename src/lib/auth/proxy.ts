import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionCookieOptions } from './session';
export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    return response;
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: sessionCookieOptions(),
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values, headers) => {
          for (const { name, value } of values) request.cookies.set(name, value);
          const next = NextResponse.next({ request });
          // Keep earlier chunk deletions/writes if the SDK flushes more than once.
          for (const cookie of response.cookies.getAll()) next.cookies.set(cookie);
          for (const [name, value] of response.headers)
            if (!name.startsWith('x-middleware-') && name !== 'set-cookie')
              next.headers.set(name, value);
          response = next;
          for (const { name, value, options } of values) response.cookies.set(name, value, options);
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
        },
      },
    },
  );
  await client.auth.getUser();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
