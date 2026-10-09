import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.headers.get('host') !== '127.0.0.1:3200')
    return new NextResponse('Local sandbox only', { status: 403 });
  const path = request.nextUrl.pathname;
  const allowedApi =
    /^\/api\/(auth|admin|learning)(\/|$)/.test(path) || path === '/api/integrations/ps-booking';
  if (
    (path.startsWith('/api/') && !allowedApi) ||
    /^\/(checkout|thanks|hub\/booking|studio)(\/|$)/.test(path)
  )
    return NextResponse.json(
      { error: 'Оплата та зовнішні інтеграції вимкнені в локальному тесті' },
      { status: 503 },
    );
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|images/|brand/).*)'] };
