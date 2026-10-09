import { randomUUID } from 'node:crypto';
import { transaction, databasePool, audit } from '../database/client';
import { liveSchema } from './schema';
import { HttpError } from '../http';
import type { LiveSession, CourseRelease, LessonProgress, ProgressRow } from './types';
import { lessonFraction } from './progress';
import { assertAdministrator } from '../auth/identity';
export async function saveLiveSession(input: unknown, actorId: string) {
  const session = liveSchema.parse(input),
    id = session.id || randomUUID();
  const releases = (
    await databasePool().query<CourseRelease>('SELECT * FROM academy.releases WHERE course_id=$1', [
      session.course_id,
    ])
  ).rows;
  if (
    !releases.some((r) =>
      r.manifest.modules.some((m) =>
        m.lessons.some(
          (l) => l.id === session.lesson_id && l.blocks.some((b) => b.kind === 'zoom'),
        ),
      ),
    )
  )
    throw new HttpError(400, 'Оберіть опублікований урок із Zoom-блоком');
  if (
    session.recording_media_id &&
    !(
      await databasePool().query(
        "SELECT id FROM academy.media WHERE id=$1 AND course_id=$2 AND kind='video' AND status='ready'",
        [session.recording_media_id, session.course_id],
      )
    ).rowCount
  )
    throw new HttpError(400, 'Запис зустрічі ще не готовий');
  return transaction(async (db) => {
    await assertAdministrator(db, actorId);
    const before = (
      await db.query<LiveSession>('SELECT * FROM academy.live_sessions WHERE id=$1', [id])
    ).rows[0];
    if (
      before &&
      (before.course_id !== session.course_id ||
        before.lesson_id !== session.lesson_id ||
        before.offering_id !== session.offering_id)
    )
      throw new HttpError(409, 'Курс, урок і набір наявної зустрічі не можна змінити');
    await db.query(
      'INSERT INTO academy.live_sessions(id,course_id,lesson_id,offering_id,title,zoom_url,starts_at,ends_at,timezone,status,recording_media_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(id) DO UPDATE SET title=excluded.title,zoom_url=excluded.zoom_url,starts_at=excluded.starts_at,ends_at=excluded.ends_at,status=excluded.status,recording_media_id=excluded.recording_media_id',
      [
        id,
        session.course_id,
        session.lesson_id,
        session.offering_id,
        session.title,
        session.zoom_url,
        session.starts_at,
        session.ends_at,
        session.timezone,
        session.status,
        session.recording_media_id,
      ],
    );
    await audit(db, { actorId, action: 'session.save', target: id, before, after: session });
    return id;
  });
}
export async function recordAttendance(
  sessionId: string,
  userIds: string[],
  actorId: string,
  attended = true,
) {
  return transaction(async (db) => {
    await assertAdministrator(db, actorId);
    const session = (
      await db.query<LiveSession>('SELECT * FROM academy.live_sessions WHERE id=$1', [sessionId])
    ).rows[0];
    if (!session || session.status === 'canceled' || Date.parse(session.ends_at) > Date.now())
      throw new HttpError(400, 'Відвідування можна підтвердити після зустрічі');
    for (const userId of userIds) {
      const row = (
        await db.query<CourseRelease>(
          'SELECT r.* FROM academy.releases r JOIN academy.grants g ON g.release_id=r.id WHERE g.user_id=$1 AND g.course_id=$2 AND ($3::text IS NULL OR g.offering_id=$3) AND g.lesson_ids ? $4 LIMIT 1',
          [userId, session.course_id, session.offering_id, session.lesson_id],
        )
      ).rows[0];
      const lesson = row?.manifest.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.id === session.lesson_id);
      if (!lesson) throw new HttpError(400, 'Студент не належить до цієї групи');
      await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        userId + ':' + session.course_id + ':' + session.lesson_id,
      ]);
      const old = (
        await db.query<ProgressRow>(
          'SELECT * FROM academy.lesson_progress WHERE user_id=$1 AND course_id=$2 AND lesson_id=$3',
          [userId, session.course_id, session.lesson_id],
        )
      ).rows[0];
      const state: LessonProgress = old?.state ? structuredClone(old.state) : { blocks: {} };
      for (const block of lesson.blocks.filter((b) => b.kind === 'zoom'))
        state.blocks[block.id] = {
          ...(state.blocks[block.id] || {
            revision: block.revision,
            ranges: [],
            coverage: [],
            activeSeconds: 0,
            pageSeconds: {},
            position: 0,
          }),
          completed: attended,
        };
      const complete = lessonFraction(lesson, state) >= 0.999999;
      await db.query(
        'INSERT INTO academy.attendance(session_id,user_id,attended,recorded_by) VALUES($1,$2,$3,$4) ON CONFLICT(session_id,user_id) DO UPDATE SET attended=excluded.attended,recorded_by=excluded.recorded_by,recorded_at=now()',
        [sessionId, userId, attended, actorId],
      );
      await db.query(
        "INSERT INTO academy.lesson_progress(user_id,course_id,lesson_id,state,completed_at,completion_source) VALUES($1,$2,$3,$4,CASE WHEN $5 THEN now() ELSE NULL END,CASE WHEN $5 THEN 'admin' ELSE NULL END) ON CONFLICT(user_id,course_id,lesson_id) DO UPDATE SET state=excluded.state,completed_at=excluded.completed_at,completion_source=excluded.completion_source,updated_at=now()",
        [userId, session.course_id, session.lesson_id, JSON.stringify(state), complete],
      );
      await audit(db, {
        actorId,
        action: attended ? 'attendance.confirm' : 'attendance.revoke',
        target: sessionId + ':' + userId,
        before: old?.state,
        after: state,
      });
    }
  });
}
export function calendarEvent(session: LiveSession) {
  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const stamp = (s: string) =>
    new Date(s)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ProPhoto//Academy//UK',
    'BEGIN:VEVENT',
    'UID:' + session.id + '@prophotoacademy.com.ua',
    'DTSTAMP:' + stamp(new Date().toISOString()),
    'DTSTART:' + stamp(session.starts_at),
    'DTEND:' + stamp(session.ends_at),
    'SUMMARY:' + escape(session.title),
    'DESCRIPTION:' + escape(session.zoom_url),
    'STATUS:' + (session.status === 'canceled' ? 'CANCELLED' : 'CONFIRMED'),
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
