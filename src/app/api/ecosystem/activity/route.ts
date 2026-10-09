import { activitySchema, authorizeOperations, recordActivity } from '@/lib/operations';
import { getContent } from '@/lib/content';
import { errorResponse, HttpError, jsonBody } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    authorizeOperations(request, 'ECOSYSTEM_INGEST_TOKEN');
    const parsed = activitySchema.safeParse(await jsonBody(request));
    if (!parsed.success) throw new HttpError(400, 'Некоректний запис активності.');
    const activity = parsed.data;
    const content = await getContent();
    if (
      activity.kind.startsWith('course') &&
      !content.programs.some((p) => p.id === activity.programId)
    )
      throw new HttpError(400, 'Потрібна відома програма.');
    if (
      activity.kind.startsWith('practice') &&
      !content.practiceSessions.some((s) => s.id === activity.practiceSessionId)
    )
      throw new HttpError(400, 'Потрібна відома практика.');
    if (activity.kind === 'studio-booking' && !content.rooms.some((r) => r.id === activity.roomId))
      throw new HttpError(400, 'Потрібна відома зала.');
    if (activity.roomId && !content.rooms.some((r) => r.id === activity.roomId))
      throw new HttpError(400, 'Залу не знайдено.');
    const productTitle = activity.kind.startsWith('course')
      ? content.programs.find((p) => p.id === activity.programId)?.title
      : activity.kind.startsWith('practice')
        ? content.practiceSessions.find((s) => s.id === activity.practiceSessionId)?.title
        : content.rooms.find((r) => r.id === activity.roomId)?.title;
    return Response.json(
      { ok: true, ...recordActivity({ ...activity, productTitle }) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
