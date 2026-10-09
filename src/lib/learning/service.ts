import { lessonWithRecording } from './recordings';
import { databasePool, transaction } from '../database/client';
import { HttpError } from '../http';
import { canReadLesson } from './access';
import { applyProgress, lessonFraction, expectedSeconds, studyBudget } from './progress';
import type {
  CourseRelease,
  Grant,
  ProgressRow,
  LiveSession,
  EnrolledCourse,
  ProgressEvent,
  LessonProgress,
  LearningMedia,
} from './types';
export async function studentCourses(userId: string): Promise<EnrolledCourse[]> {
  const db = databasePool();
  const grants = (
    await db.query<Grant>(
      'SELECT * FROM academy.grants WHERE user_id=$1 ORDER BY created_at DESC',
      [userId],
    )
  ).rows;
  const releases = (
    await db.query<CourseRelease>('SELECT * FROM academy.releases WHERE id=ANY($1::text[])', [
      grants.map((g) => g.release_id),
    ])
  ).rows;
  const progress = (
    await db.query<ProgressRow>('SELECT * FROM academy.lesson_progress WHERE user_id=$1', [userId])
  ).rows;
  const sessions = (
    await db.query<LiveSession>(
      'SELECT * FROM academy.live_sessions WHERE course_id=ANY($1::text[]) ORDER BY starts_at',
      [grants.map((g) => g.course_id)],
    )
  ).rows;
  const recordings = (
    await db.query<LearningMedia>(
      "SELECT * FROM academy.media WHERE id=ANY($1::uuid[]) AND kind='video' AND status='ready'",
      [sessions.map((s) => s.recording_media_id).filter(Boolean)],
    )
  ).rows;
  return releases.map((r) => ({
    course: {
      ...r.manifest,
      modules: r.manifest.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) =>
          lessonWithRecording(
            l,
            r.course_id,
            grants.filter((g) => g.release_id === r.id),
            { sessions, media: recordings },
          ),
        ),
      })),
    },
    releaseId: r.id,
    grants: grants.filter((g) => g.release_id === r.id),
    progress: progress.filter((p) => p.course_id === r.course_id),
    sessions: sessions.filter(
      (s) =>
        s.course_id === r.course_id &&
        (!s.offering_id ||
          grants.some((g) => g.release_id === r.id && g.offering_id === s.offering_id)),
    ),
  }));
}
export function safeEnrollment(
  enrollment: EnrolledCourse,
  currentLessonId?: string,
): EnrolledCourse {
  return {
    ...enrollment,
    course: {
      ...enrollment.course,
      modules: enrollment.course.modules
        .map((m) => ({
          ...m,
          lessons: m.lessons
            .filter((l) => enrollment.grants.some((g) => g.lesson_ids.includes(l.id)))
            .map((l) => ({
              ...l,
              summary: l.id === currentLessonId ? l.summary : '',
              blocks:
                l.id === currentLessonId && canReadLesson(enrollment.grants, l)
                  ? l.blocks
                  : l.blocks.map((b) => ({
                      id: b.id,
                      kind: b.kind,
                      title: '',
                      required: b.required,
                      revision: b.revision,
                      expectedSeconds: expectedSeconds(b),
                      duration: b.duration,
                      pageSeconds: b.pageSeconds,
                    })),
            })),
        }))
        .filter((m) => m.lessons.length),
    },
    sessions: enrollment.sessions.map((s) => ({
      ...s,
      zoom_url: s.lesson_id === currentLessonId ? s.zoom_url : '',
      recording_media_id: s.lesson_id === currentLessonId ? s.recording_media_id : null,
    })),
  };
}
export async function studentLesson(userId: string, courseId: string, lessonId: string) {
  const courses = await studentCourses(userId),
    candidates = courses.filter((c) => c.course.id === courseId);
  for (const enrollment of candidates) {
    const lessons = enrollment.course.modules.flatMap((m) => m.lessons),
      lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || !canReadLesson(enrollment.grants, lesson)) continue;
    const allowed = lessons.filter((l) => canReadLesson(enrollment.grants, l)),
      index = allowed.findIndex((l) => l.id === lessonId);
    return {
      enrollment: safeEnrollment(enrollment, lessonId),
      lesson,
      progress: enrollment.progress.find((p) => p.lesson_id === lessonId)?.state || { blocks: {} },
      nextLessonId: allowed[index + 1]?.id,
    };
  }
  throw new HttpError(403, 'Цей урок наразі недоступний для вашого пакета');
}
export async function saveProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  event: ProgressEvent,
) {
  const view = await studentLesson(userId, courseId, lessonId);
  if (event.manual && view.lesson.blocks.some((b) => b.kind === 'zoom' && b.required))
    throw new HttpError(400, 'Участь у зустрічі підтверджує викладач, або перегляньте запис');
  return transaction(async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      userId + ':' + courseId + ':' + lessonId,
    ]);
    const old = (
      await db.query<ProgressRow>(
        'SELECT * FROM academy.lesson_progress WHERE user_id=$1 AND course_id=$2 AND lesson_id=$3',
        [userId, courseId, lessonId],
      )
    ).rows[0];
    const previous: LessonProgress = old?.state || { blocks: {} };
    const inserted = await db.query(
      'INSERT INTO academy.progress_events(user_id,event_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id',
      [userId, event.id],
    );
    if (!inserted.rowCount)
      return {
        state: previous,
        progress: lessonFraction(view.lesson, previous),
        completed: !!old?.completed_at,
      };
    const session = (
      await db.query('SELECT * FROM academy.progress_sessions WHERE id=$1 FOR UPDATE', [
        event.sessionId,
      ])
    ).rows[0];
    if (session && (session.user_id !== userId || session.lesson_id !== lessonId))
      throw new HttpError(403, 'Недійсний сеанс навчання');
    if (session && event.sequence <= session.sequence)
      return {
        state: previous,
        progress: lessonFraction(view.lesson, previous),
        completed: !!old?.completed_at,
      };
    const budget = studyBudget(previous, event);
    const state = {
        ...applyProgress(view.lesson, previous, event, budget.elapsed),
        studyRanges: budget.ranges,
      },
      fraction = lessonFraction(view.lesson, state),
      complete = fraction >= 0.999999;
    await db.query(
      'INSERT INTO academy.progress_sessions(id,user_id,lesson_id,sequence) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET sequence=excluded.sequence,last_seen=now()',
      [event.sessionId, userId, lessonId, event.sequence],
    );
    await db.query(
      'INSERT INTO academy.lesson_progress(user_id,course_id,lesson_id,state,completed_at,completion_source,last_active_at) VALUES($1,$2,$3,$4,CASE WHEN $5 THEN now() ELSE NULL END,$6,now()) ON CONFLICT(user_id,course_id,lesson_id) DO UPDATE SET state=excluded.state,completed_at=CASE WHEN excluded.completed_at IS NULL THEN NULL ELSE coalesce(academy.lesson_progress.completed_at,excluded.completed_at) END,completion_source=excluded.completion_source,updated_at=now(),last_active_at=now()',
      [
        userId,
        courseId,
        lessonId,
        JSON.stringify(state),
        complete,
        complete ? state.manual || 'automatic' : null,
      ],
    );
    return { state, progress: fraction, completed: complete };
  });
}
