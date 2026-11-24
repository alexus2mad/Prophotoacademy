import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/server';
import { errorResponse, guardMutation, jsonBody } from '@/lib/http';
import { revalidatePublication } from '@/lib/site-editor/revalidate';
import { syncOverview, syncPage } from '@/lib/site-editor/sync/production';
import { pagePathSchema } from '@/lib/site-editor/validation';

const headers = { 'Cache-Control': 'private, no-store' };
const request = z.object({
  path: pagePathSchema,
  stagingDigest: z.string().regex(/^[a-f0-9]{64}$/),
  revision: z.string().max(256).nullable(),
});

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await syncOverview(), { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(input: Request) {
  try {
    await requireAdmin();
    await guardMutation(input, 'site-editor');
    const data = request.parse(await jsonBody(input, 16 * 1024));
    const result = await syncPage(data.path, data.stagingDigest, data.revision);
    revalidatePublication(result.page);
    return Response.json(result, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
