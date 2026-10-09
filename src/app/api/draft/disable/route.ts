import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin)
    return new Response('Invalid origin', { status: 403 });
  (await draftMode()).disable();
  return NextResponse.redirect(new URL('/', request.url), 303);
}
