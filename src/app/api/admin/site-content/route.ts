import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/server';
import { revalidatePublication } from '@/lib/site-editor/revalidate';
import { withEditorTarget } from '@/lib/site-editor/storage/config';
import { parseTarget } from '@/lib/site-editor/storage/target';
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
const env = z.enum(['production', 'staging']).optional();
const mutation = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    env,
    path: pagePathSchema,
    title: pageTitleSchema,
    kind: newPageKind,
    template: pageTemplateSchema.optional(),
  }),
  z.object({
    action: z.enum(['save', 'publish']),
    env,
    page: z.unknown(),
    revision: z.string().max(256).nullable(),
  }),
]);

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const path = params.get('path');
    const result = await withEditorTarget(parseTarget(params.get('env')), () =>
      path === null ? listEditorPages().then((pages) => ({ pages })) : getEditorPage(path),
    );
    return Response.json(result, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await guardMutation(request, 'site-editor');
    const data = mutation.parse(await jsonBody(request, 2 * 1024 * 1024));
    const target = parseTarget(data.env);
    if (data.action === 'create')
      return Response.json(
        await withEditorTarget(target, () =>
          createSiteDraft(data.path, data.title, data.kind, data.template),
        ),
        { status: 201, headers },
      );
    const result = await withEditorTarget(target, () =>
      writeSitePage(data.page, data.revision, data.action === 'publish'),
    );
    // Staging renders its own published pages; this server's routes show production content.
    if (data.action === 'publish' && target === 'production') revalidatePublication(result.page);
    return Response.json(result, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
