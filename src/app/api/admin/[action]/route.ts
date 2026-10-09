import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/server';
import { createCourse } from '@/lib/learning/authoring';
import { createMediaUpload, finishMediaUpload } from '@/lib/learning/media';
import { saveLiveSession } from '@/lib/learning/live';
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
