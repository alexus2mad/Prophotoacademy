import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/server';
import { sessionRoster } from '@/lib/admin/queries';
import { errorResponse } from '@/lib/http';
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const sessionId = z.uuid().parse(new URL(request.url).searchParams.get('sessionId'));
    return Response.json(
      { people: await sessionRoster(sessionId) },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
