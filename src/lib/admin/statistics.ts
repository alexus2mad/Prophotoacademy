import { lessonFraction } from '../learning/progress';
import type { CourseRelease, Grant, ProgressRow, RecordingContext } from '../learning/types';
import { lessonWithRecording } from '../learning/recordings';
import type { GrantStatistics, CourseStatistics } from './types';
export function grantStatistics(
  grants: Grant[],
  releases: CourseRelease[],
  progress: ProgressRow[],
  recordings: RecordingContext = { sessions: [], media: [] },
): GrantStatistics[] {
  return grants.map((grant) => {
    const release = releases.find((r) => r.id === grant.release_id);
    const lessons = (release?.manifest.modules.flatMap((m) => m.lessons) || [])
      .filter((l) => grant.lesson_ids.includes(l.id))
      .map((lesson) => {
        const row = progress.find(
          (p) =>
            p.user_id === grant.user_id &&
            p.course_id === grant.course_id &&
            p.lesson_id === lesson.id,
        );
        return {
          id: lesson.id,
          title: lesson.title,
          progress: lessonFraction(
            lessonWithRecording(lesson, grant.course_id, [grant], recordings),
            row?.state || { blocks: {} },
          ),
          source: row?.completion_source || null,
        };
      });
    return {
      grantId: grant.id,
      progress: lessons.length
        ? lessons.reduce((sum, l) => sum + l.progress, 0) / lessons.length
        : 0,
      total: lessons.length,
      completed: lessons.filter((l) => l.progress >= 0.999).length,
      lessons,
    };
  });
}
export function courseStatistics(
  grants: Grant[],
  releases: CourseRelease[],
  progress: ProgressRow[],
  recordings: RecordingContext = { sessions: [], media: [] },
): CourseStatistics[] {
  const stats = grantStatistics(grants, releases, progress, recordings);
  const courses = new Map<string, CourseStatistics>();
  for (const release of releases) {
    if (!courses.has(release.course_id))
      courses.set(release.course_id, {
        id: release.course_id,
        title: release.manifest.title,
        students: 0,
        completed: 0,
        progress: 0,
      });
  }
  const memberships = new Map<string, Grant[]>();
  for (const grant of grants) {
    if (!grant.user_id) continue;
    const key = grant.course_id + ':' + grant.user_id;
    memberships.set(key, [...(memberships.get(key) || []), grant]);
  }
  for (const membership of memberships.values()) {
    const course = courses.get(membership[0].course_id);
    if (!course) continue;
    // Prefer live grants; retain historical progress when all access has ended.
    const current = membership.filter(
      (g) => !g.revoked_at && (!g.expires_at || new Date(g.expires_at).getTime() > Date.now()),
    );
    const relevant = (current.length ? current : membership).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const lessons = new Map<string, number>();
    for (const grant of relevant)
      for (const lesson of stats.find((s) => s.grantId === grant.id)?.lessons || []) {
        if (!lessons.has(lesson.id)) lessons.set(lesson.id, lesson.progress);
      }
    const fraction = lessons.size
      ? [...lessons.values()].reduce((a, b) => a + b, 0) / lessons.size
      : 0;
    course.students++;
    course.progress += fraction;
    if (fraction >= 0.999) course.completed++;
  }
  for (const course of courses.values()) if (course.students) course.progress /= course.students;
  return [...courses.values()];
}
