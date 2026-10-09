import type { Lesson, Grant, RecordingContext } from './types';
export function lessonWithRecording(
  lesson: Lesson,
  courseId: string,
  grants: Grant[],
  context: RecordingContext,
): Lesson {
  const session = context.sessions.find(
    (s) =>
      s.course_id === courseId &&
      s.lesson_id === lesson.id &&
      s.status !== 'canceled' &&
      (!s.offering_id || grants.some((g) => g.offering_id === s.offering_id)),
  );
  const asset = context.media.find(
    (m) => m.id === session?.recording_media_id && m.course_id === courseId && m.status === 'ready',
  );
  return asset
    ? {
        ...lesson,
        blocks: lesson.blocks.map((b) =>
          b.kind === 'zoom' ? { ...b, mediaId: asset.id, duration: Number(asset.duration) } : b,
        ),
      }
    : lesson;
}
