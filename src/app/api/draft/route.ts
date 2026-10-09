import { draftMode } from 'next/headers';
import { createClient } from '@sanity/client';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!projectId || !token) return new Response('Preview is not configured', { status: 503 });
  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-10-01',
    useCdn: false,
    token,
  });
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(client, request.url);
  if (!isValid) return new Response('Invalid preview token', { status: 401 });
  const target = new URL(redirectTo, request.url);
  const current = new URL(request.url);
  if (target.origin !== current.origin || !/^\/(?:[a-z0-9-]+)?$/.test(target.pathname))
    return new Response('Invalid preview destination', { status: 400 });
  (await draftMode()).enable();
  return NextResponse.redirect(target);
}
