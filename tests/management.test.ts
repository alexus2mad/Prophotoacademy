import { describe, it, expect } from 'vitest';
import { createHmac, randomUUID } from 'node:crypto';
import { verifyManagementSignature } from '../src/lib/admin/signature';
import { scheduleInstant, localSchedule } from '../src/lib/learning/schedule';
import { grantStatistics, courseStatistics } from '../src/lib/admin/statistics';
import { demoEnrollment } from '../src/lib/learning/demo';
describe('ps-booking management boundary', () => {
  it('counts a student once while combining independent course grants', () => {
    const data = demoEnrollment,
      grant = data.grants[0];
    const grants = [
      { ...grant, id: 'a', lesson_ids: grant.lesson_ids.slice(0, 2) },
      { ...grant, id: 'b', lesson_ids: grant.lesson_ids.slice(2) },
    ];
    const [result] = courseStatistics(
      grants,
      [
        {
          id: data.releaseId,
          course_id: data.course.id,
          version: 1,
          published_at: '2026-10-01T00:00:00Z',
          manifest: data.course,
        },
      ],
      data.progress,
    );
    expect(result.students).toBe(1);
    expect(result.progress).toBeCloseTo(1 / 3);
    expect(result.completed).toBe(0);
  });
  it('requires a valid timestamp, unique nonce shape and exact signed body', () => {
    const secret = 'test-only-secret-with-at-least-32-characters',
      body = '{"action":"people"}',
      time = String(Date.now()),
      nonce = randomUUID();
    const signature = createHmac('sha256', secret)
      .update(time + '\n' + nonce + '\n' + body)
      .digest('hex');
    const headers = new Headers({
      'x-prophoto-time': time,
      'x-prophoto-nonce': nonce,
      'x-prophoto-signature': signature,
    });
    expect(verifyManagementSignature(body, headers, secret)).toBe(nonce);
    expect(() => verifyManagementSignature(body + ' ', headers, secret)).toThrow('signature');
    expect(() => verifyManagementSignature(body, headers, secret, Number(time) + 300001)).toThrow(
      'request',
    );
    expect(() => verifyManagementSignature(body, headers, 'short')).toThrow('unavailable');
  });
  it('computes student progress from the assigned curriculum and ignores supplementary blocks', () => {
    const data = demoEnrollment;
    const result = grantStatistics(
      data.grants,
      [
        {
          id: data.releaseId,
          course_id: data.course.id,
          version: 1,
          published_at: '2026-10-01T00:00:00Z',
          manifest: data.course,
        },
      ],
      data.progress,
    );
    expect(result[0].total).toBe(6);
    expect(result[0].completed).toBe(2);
    expect(result[0].progress).toBeCloseTo(1 / 3);
  });
});
describe('Kyiv scheduling', () => {
  it('converts summer and winter local times correctly', () => {
    expect(scheduleInstant('2026-07-10T19:00')).toBe('2026-07-10T16:00:00.000Z');
    expect(scheduleInstant('2026-12-10T19:00')).toBe('2026-12-10T17:00:00.000Z');
  });
  it('rejects skipped spring time and explicitly resolves repeated autumn time', () => {
    expect(() => scheduleInstant('2026-03-29T03:30')).toThrow('пропущено');
    const early = scheduleInstant('2026-10-25T03:30', 'Europe/Kyiv', 'earlier'),
      late = scheduleInstant('2026-10-25T03:30', 'Europe/Kyiv', 'later');
    expect(Date.parse(late) - Date.parse(early)).toBe(3600000);
    expect(localSchedule(early)).toBe(localSchedule(late));
  });
});
