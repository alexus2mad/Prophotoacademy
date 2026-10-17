import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/server';
import { createCourse } from '@/lib/learning/authoring';
import { createMediaUpload, finishMediaUpload } from '@/lib/learning/media';
import { saveLiveSession } from '@/lib/learning/live';
import { deletePromoCode, savePromoCode } from '@/lib/commerce/promo';
import { manageAccess } from '@/lib/admin/access';
import { changeAdministrator } from '@/lib/auth/identity';
import { recordAttendance } from '@/lib/learning/live';
import { transaction } from '@/lib/database/client';
import { getContent } from '@/lib/content';
import { errorResponse, guardMutation, HttpError, jsonBody } from '@/lib/http';
import type { ActionRouteProps } from '@/app/types';
export async function POST(request: Request, { params }: ActionRouteProps) {
  try {
    await guardMutation(request, 'admin');
    const { action } = await params;
    const user = await requireAdmin();
    const input = await jsonBody(request, 131_072);
    let result: unknown;
    if (action === 'courses')
      result = await createCourse(
        z.object({ programId: z.string() }).parse(input).programId,
        user.id,
      );
    else if (action === 'sessions') result = await saveLiveSession(input, user.id);
    else if (action === 'promo-code-delete') result = await deletePromoCode(input, user.id);
    else if (action === 'access') result = await manageAccess(input, user.id);
    else if (action === 'team') {
      // Administrator changes need an email code confirmed in the last ten minutes.
      const actor = await requireAdmin(true);
      const value = z
        .object({
          email: z.string().trim().toLowerCase().pipe(z.email()),
          grant: z.boolean(),
          reason: z.string().trim().min(3).max(1000),
        })
        .parse(input);
      await transaction((db) =>
        changeAdministrator(db, actor.id, value.email, value.grant, value.reason),
      );
      result = { ok: true };
    } else if (action === 'attendance') {
      const value = z
        .object({
          sessionId: z.uuid(),
          userIds: z.array(z.uuid()).min(1).max(500),
          attended: z.boolean(),
        })
        .parse(input);
      await recordAttendance(value.sessionId, value.userIds, user.id, value.attended);
      result = { ok: true };
    } else if (action === 'promo-codes')
      result = await savePromoCode(
        input,
        user.id,
        (await getContent()).programs.map((p) => p.id),
      );
    else if (action === 'uploads') {
      const value = z
        .object({
          courseId: z.string(),
          kind: z.enum(['video', 'image', 'pdf']),
          title: z.string().min(1).max(180),
          mime: z.string().max(100),
        })
        .parse(input);
      result = await createMediaUpload(value, user.id);
    } else if (action === 'upload-complete') {
      const value = z
        .object({
          id: z.uuid(),
          pageSeconds: z.array(z.number().min(1).max(3600)).max(1000).optional(),
        })
        .parse(input);
      result = await finishMediaUpload(value.id, value.pageSeconds);
    } else throw new HttpError(404, 'Не знайдено');
    return Response.json({ ok: true, result });
  } catch (error) {
    return errorResponse(error);
  }
}
