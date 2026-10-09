import { requireMember } from '@/lib/auth/server';
import { studentLesson } from '@/lib/learning/service';
import { calendarEvent } from '@/lib/learning/live';
import { HttpError, errorResponse } from '@/lib/http';
import type { LearningPageProps } from '@/app/types';
export async function GET(request: Request, { params }: LearningPageProps) {
  try {
    const user = await requireMember();
    const { course, lesson } = await params;
    const view = await studentLesson(user.id, course, lesson);
    const session = view.enrollment.sessions.find(
      (s) => s.id === new URL(request.url).searchParams.get('session') && s.lesson_id === lesson,
    );
    if (!session) throw new HttpError(404, 'Зустріч не знайдено');
    return new Response(calendarEvent(session), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="prophoto-session.ics"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
