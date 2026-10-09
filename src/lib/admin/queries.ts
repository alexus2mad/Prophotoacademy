import { databasePool } from '../database/client';
import { getContent } from '../content';
import { grantStatistics, courseStatistics } from './statistics';
import type {
  AdminCourse,
  AdminPerson,
  AdminOverviewData,
  CourseEditorData,
  PurchaseView,
  TeamData,
  UserDetail,
} from './types';
import type {
  CourseRelease,
  Grant,
  LearningMedia,
  LiveSession,
  ProgressRow,
  PackageRuleInput,
} from '../learning/types';
import type { Member } from '../auth/types';
async function recordingContext() {
  const db = databasePool();
  const [sessions, media] = await Promise.all([
    db.query<LiveSession>('SELECT * FROM academy.live_sessions ORDER BY starts_at DESC'),
    db.query<LearningMedia>("SELECT * FROM academy.media WHERE kind='video' AND status='ready'"),
  ]);
  return { sessions: sessions.rows, media: media.rows };
}
export async function adminOverview(): Promise<AdminOverviewData> {
  const db = databasePool();
  const row = (
    await db.query(
      "SELECT (SELECT count(*)::int FROM academy.courses) AS courses,(SELECT count(*)::int FROM academy.profiles) AS students,(SELECT count(*)::int FROM academy.grants WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at>now())) AS active_grants,(SELECT count(*)::int FROM academy.courses WHERE active_release_id IS NULL) AS unpublished,(SELECT count(*)::int FROM academy.media WHERE status='failed') AS failed_media,(SELECT count(*)::int FROM academy.outbox WHERE state='pending' AND attempts>0) AS pending_emails",
    )
  ).rows[0];
  const [allGrants, allReleases, allProgress] = await Promise.all([
    db.query<Grant>('SELECT * FROM academy.grants ORDER BY created_at DESC'),
    db.query<CourseRelease>('SELECT * FROM academy.releases ORDER BY version DESC'),
    db.query<ProgressRow>('SELECT * FROM academy.lesson_progress'),
  ]);
  return {
    courseStats: courseStatistics(
      allGrants.rows,
      allReleases.rows,
      allProgress.rows,
      await recordingContext(),
    ),
    courses: row.courses,
    students: row.students,
    activeGrants: row.active_grants,
    unpublished: row.unpublished,
    failedMedia: row.failed_media,
    pendingEmails: row.pending_emails,
    sessions: (
      await db.query<LiveSession>(
        "SELECT * FROM academy.live_sessions WHERE ends_at>now()-interval '30 days' AND status<>'canceled' ORDER BY starts_at DESC LIMIT 50",
      )
    ).rows,
  };
}
export async function adminCourses() {
  const [result, content] = await Promise.all([
    databasePool().query<AdminCourse>('SELECT * FROM academy.courses ORDER BY created_at DESC'),
    getContent(),
  ]);
  return {
    courses: result.rows,
    programs: content.programs.map((p) => ({ id: p.id, title: p.title })),
  };
}
export async function courseEditorData(id: string): Promise<CourseEditorData> {
  const db = databasePool();
  const [releases, media, sessions, rules, content] = await Promise.all([
    db.query<CourseRelease>(
      'SELECT * FROM academy.releases WHERE course_id=$1 ORDER BY version DESC',
      [id],
    ),
    db.query<LearningMedia>(
      'SELECT * FROM academy.media WHERE course_id=$1 ORDER BY created_at DESC',
      [id],
    ),
    db.query<LiveSession>(
      'SELECT * FROM academy.live_sessions WHERE course_id=$1 ORDER BY starts_at',
      [id],
    ),
    db.query('SELECT * FROM academy.package_rules WHERE course_id=$1', [id]),
    getContent(),
  ]);
  const course = (await db.query<AdminCourse>('SELECT * FROM academy.courses WHERE id=$1', [id]))
    .rows[0];
  return {
    releases: releases.rows,
    media: media.rows,
    sessions: sessions.rows,
    offerings: content.offerings.filter((o) => o.programId === course?.program_id),
    rules: rules.rows.map(
      (r) =>
        ({
          offeringId: r.offering_id,
          packageId: r.package_id,
          releaseId: r.release_id,
          lessonIds: r.lesson_ids,
          accessMonths: r.access_months,
          startsAt: r.starts_at ? new Date(r.starts_at).toISOString() : null,
        }) as PackageRuleInput,
    ),
  };
}
export async function adminPeople(query = ''): Promise<AdminPerson[]> {
  return (
    await databasePool().query<AdminPerson>(
      'SELECT p.*,count(DISTINCT g.course_id)::int AS course_count FROM academy.profiles p LEFT JOIN academy.grants g ON g.user_id=p.id WHERE p.email ILIKE $1 OR p.name ILIKE $1 GROUP BY p.id ORDER BY p.created_at DESC LIMIT 100',
      ['%' + query.slice(0, 100) + '%'],
    )
  ).rows;
}
export async function purchasesFor(email: string): Promise<PurchaseView[]> {
  const result = await databasePool().query(
    "SELECT id,data,created_at FROM academy.orders WHERE lower(trim(data->'customer'->>'email'))=$1 AND data->>'mode'='wayforpay' ORDER BY created_at DESC LIMIT 200",
    [email],
  );
  return result.rows.map((r) => ({
    id: r.id,
    title: r.data.programTitle,
    packageName: r.data.packageName,
    amount: Math.round(r.data.amount * 100),
    currency: r.data.currency,
    status: r.data.status,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}
export async function adminPerson(email: string): Promise<UserDetail> {
  const db = databasePool();
  const profile =
    (
      await db.query<AdminPerson>(
        'SELECT *,0 AS course_count FROM academy.profiles WHERE email=$1',
        [email],
      )
    ).rows[0] || null;
  const detail: UserDetail = {
    profile,
    email,
    grants: (
      await db.query<Grant>(
        'SELECT * FROM academy.grants WHERE email=$1 ORDER BY created_at DESC',
        [email],
      )
    ).rows,
    progress: profile
      ? (
          await db.query<ProgressRow>('SELECT * FROM academy.lesson_progress WHERE user_id=$1', [
            profile.id,
          ])
        ).rows
      : [],
    courses: (
      await db.query<CourseRelease>(
        'SELECT r.* FROM academy.releases r JOIN academy.courses c ON c.id=r.course_id ORDER BY c.title,r.version DESC',
      )
    ).rows,
    purchases: await purchasesFor(email),
  };
  return {
    ...detail,
    learning: grantStatistics(
      detail.grants,
      detail.courses,
      detail.progress,
      await recordingContext(),
    ),
  };
}
export async function adminTeam(): Promise<TeamData> {
  const db = databasePool();
  return {
    members: (
      await db.query<Member>(
        "SELECT * FROM academy.profiles WHERE role='admin' ORDER BY created_at",
      )
    ).rows,
    invitations: (
      await db.query(
        'SELECT email,created_at FROM academy.admin_invitations WHERE claimed_at IS NULL ORDER BY created_at',
      )
    ).rows,
  };
}
