import type { MediaAccess } from './types';

export function mediaResponse(request: Request, access: MediaAccess) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (new URL(request.url).searchParams.get('download') === '1' && access.url)
    return new Response(null, { status: 302, headers: { ...headers, Location: access.url } });
  return Response.json(access, { headers });
}
