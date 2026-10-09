import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/server';
import { getDraft, saveDraft, publishCourse, savePackageRule } from '@/lib/learning/authoring';
import { packageRuleSchema } from '@/lib/learning/schema';
import { errorResponse, guardMutation, jsonBody } from '@/lib/http';
import type { IdRouteProps } from '@/app/types';
export async function GET(_request: Request, { params }: IdRouteProps) {
  try {
    await requireAdmin();
    return Response.json(await getDraft((await params).id), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request, { params }: IdRouteProps) {
  try {
    await guardMutation(request, 'author');
    const user = await requireAdmin();
    const { id } = await params;
    const input = z
      .object({ action: z.enum(['save', 'publish', 'package']), value: z.unknown() })
      .parse(await jsonBody(request, 1_048_576));
    const result =
      input.action === 'save'
        ? await saveDraft(id, input.value, user.id)
        : input.action === 'publish'
          ? await publishCourse(
              id,
              z.object({ revision: z.string() }).parse(input.value).revision,
              user.id,
            )
          : await savePackageRule(id, packageRuleSchema.parse(input.value), user.id);
    return Response.json({ ok: true, result });
  } catch (error) {
    return errorResponse(error);
  }
}
