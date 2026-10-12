import { requireMember } from '@/lib/auth/server';
import { studentLesson } from '@/lib/learning/service';
import { mediaAccess } from '@/lib/learning/media';
import { mediaResponse } from '@/lib/learning/media-response';
import { HttpError, errorResponse } from '@/lib/http';
import type { LessonMediaRouteProps } from '@/app/types';
export async function GET(request: Request, { params }: LessonMediaRouteProps) {
  try {
    const user = await requireMember();
    const { course, lesson, id } = await params;
    const view = await studentLesson(user.id, course, lesson);
    if (
      !view.lesson.blocks.some((b) => b.mediaId === id) &&
      !view.enrollment.sessions.some((s) => s.lesson_id === lesson && s.recording_media_id === id)
    )
      throw new HttpError(403, 'Немає доступу до матеріалу');
    return mediaResponse(request, await mediaAccess(id));
  } catch (error) {
    return errorResponse(error);
  }
}
