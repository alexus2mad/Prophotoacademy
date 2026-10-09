import { NextResponse, type NextRequest } from 'next/server';
import { hubRewritePath, isHubHost } from './lib/ecosystem';
import { refreshSession } from './lib/auth/proxy';
export async function proxy(request: NextRequest) {
  const accountRoute = /^\/(account|login|learn|admin)(\/|$)/.test(request.nextUrl.pathname);
  if (
    accountRoute &&
    isHubHost(request.headers.get('host') || '') &&
    process.env.NEXT_PUBLIC_ACADEMY_URL?.startsWith('https://')
  ) {
    const target = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      process.env.NEXT_PUBLIC_ACADEMY_URL,
    );
    return NextResponse.redirect(target);
  }
  if (accountRoute || request.nextUrl.pathname.startsWith('/api/auth/'))
    return refreshSession(request);
  if (!isHubHost(request.headers.get('host') || '')) {
    const base = process.env.NEXT_PUBLIC_HUB_URL;
    if (
      base?.startsWith('https://') &&
      (request.nextUrl.pathname === '/hub' || request.nextUrl.pathname.startsWith('/hub/'))
    ) {
      const url = new URL(base);
      url.pathname = request.nextUrl.pathname.slice(4) || '/';
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  const path = hubRewritePath(url.pathname);
  if (!path) return NextResponse.next();
  url.pathname = path;
  return NextResponse.rewrite(url);
}
export const config = { matcher: ['/((?!_next/static|_next/image|images/|brand/).*)'] };
