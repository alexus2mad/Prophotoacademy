import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/server';
import { revalidatePublication } from '@/lib/site-editor/revalidate';
import { errorResponse, guardMutation, jsonBody } from '@/lib/http';
import {
  createSiteDraft,
  getEditorPage,
  listEditorPages,
  writeSitePage,
} from '@/lib/site-editor/store';
import {
  newPageKind,
  pagePathSchema,
  pageTemplateSchema,
  pageTitleSchema,
} from '@/lib/site-editor/validation';

const headers = { 'Cache-Control': 'private, no-store' };
const mutation = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    path: pagePathSchema,
    title: pageTitleSchema,
    kind: newPageKind,
    template: pageTemplateSchema.optional(),
  }),
  z.object({
    action: z.enum(['save', 'publish']),
    page: z.unknown(),
    revision: z.string().max(256).nullable(),
  }),
]);

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const path = new URL(request.url).searchParams.get('path');
    return Response.json(
      path === null ? { pages: await listEditorPages() } : await getEditorPage(path),
      { headers },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await guardMutation(request, 'site-editor');
    const data = mutation.parse(await jsonBody(request, 2 * 1024 * 1024));
    if (data.action === 'create')
      return Response.json(await createSiteDraft(data.path, data.title, data.kind, data.template), {
        status: 201,
        headers,
      });
    const result = await writeSitePage(data.page, data.revision, data.action === 'publish');
    if (data.action === 'publish') revalidatePublication(result.page);
    return Response.json(result, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
