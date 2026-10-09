import type { Grant, Lesson } from './types';
export function grantActive(grant: Grant, now = Date.now()) {
  return !grant.revoked_at && (!grant.expires_at || Date.parse(grant.expires_at) > now);
}
export function canReadLesson(grants: Grant[], lesson: Lesson, now = Date.now()) {
  return (
    (!lesson.releaseAt || Date.parse(lesson.releaseAt) <= now) &&
    grants.some(
      (g) =>
        grantActive(g, now) &&
        g.lesson_ids.includes(lesson.id) &&
        (lesson.introductory || Date.parse(g.starts_at) <= now),
    )
  );
}
export function accessDates(paidAt: string, months: number | null, startAt: string | null) {
  const start = new Date(Math.max(Date.parse(paidAt), startAt ? Date.parse(startAt) : 0));
  if (months === null) return { startsAt: start.toISOString(), expiresAt: null };
  const end = new Date(start),
    day = end.getUTCDate();
  end.setUTCDate(1);
  end.setUTCMonth(end.getUTCMonth() + months);
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(day, last));
  return { startsAt: start.toISOString(), expiresAt: end.toISOString() };
}
export function liveStatus(start: string, end: string, status: string, now = Date.now()) {
  return status === 'canceled'
    ? 'canceled'
    : now < Date.parse(start)
      ? 'upcoming'
      : now <= Date.parse(end)
        ? 'live'
        : 'finished';
}
