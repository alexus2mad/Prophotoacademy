import type { EnrolledCourse, EnrollmentCardView } from './types';
import { canReadLesson, grantActive } from './access';
import { lessonFraction } from './progress';
export function enrollmentCard(enrollment: EnrolledCourse): EnrollmentCardView {
  const lessons = enrollment.course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => enrollment.grants.some((g) => g.lesson_ids.includes(l.id)));
  const available = lessons.filter((l) => canReadLesson(enrollment.grants, l));
  const last = [...enrollment.progress]
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
    .find((p) => available.some((l) => l.id === p.lesson_id) && !p.completed_at);
  const next =
    available.find((l) => l.id === last?.lesson_id) ||
    available.find(
      (l) =>
        lessonFraction(
          l,
          enrollment.progress.find((p) => p.lesson_id === l.id)?.state || { blocks: {} },
        ) < 1,
    ) ||
    available[0];
  const fractions = lessons.map((l) =>
    lessonFraction(
      l,
      enrollment.progress.find((p) => p.lesson_id === l.id)?.state || { blocks: {} },
    ),
  );
  const active = enrollment.grants.filter((g) => grantActive(g));
  const expires = active.some((g) => !g.expires_at)
    ? null
    : active.reduce<string | null>(
        (date, g) => (!date || Date.parse(g.expires_at!) > Date.parse(date) ? g.expires_at : date),
        null,
      );
  return {
    id: enrollment.releaseId,
    courseId: enrollment.course.id,
    title: enrollment.course.title,
    cover: enrollment.course.cover,
    packageName: active[0]?.package_name || enrollment.grants[0]?.package_name || '',
    progress: fractions.length ? fractions.reduce((a, b) => a + b, 0) / fractions.length : 0,
    completed: fractions.filter((f) => f >= 0.999999).length,
    total: lessons.length,
    nextLessonId: next?.id,
    nextLessonTitle: next?.title,
    expiresAt: expires,
    status: active.length ? (available.length ? 'active' : 'scheduled') : 'expired',
  };
}
export const lessonHref = (course: string, lesson: string, demo = false) =>
  demo ? '/demo/learn/' + lesson : '/learn/' + course + '/' + lesson;
export const assetHref = (src: string) => {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '/Prophotoacademy';
  return src.startsWith('/') &&
    !src.startsWith(base + '/') &&
    process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages'
    ? base + src
    : src;
};
export const displayDate = (value: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Kyiv',
  }).format(new Date(value));
