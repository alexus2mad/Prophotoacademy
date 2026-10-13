import { describe, expect, it } from 'vitest';
import { safeEnrollment } from '../src/lib/learning/service';
import { demoEnrollment } from '../src/lib/learning/demo';
import { lessonFraction } from '../src/lib/learning/progress';
import { enrollmentCard } from '../src/lib/learning/selectors';
import { grantStatistics } from '../src/lib/admin/statistics';
describe('consistent quiz-only completion', () => {
  it('counts scheduled lessons in the denominator and agrees with booking statistics', () => {
    const enrollment = structuredClone(demoEnrollment);
    enrollment.course.modules = [
      {
        id: 'm',
        title: 'M',
        lessons: enrollment.course.modules.flatMap((m) => m.lessons).slice(0, 3),
      },
    ];
    enrollment.course.modules[0].lessons[2].releaseAt = '2099-01-01T00:00:00Z';
    enrollment.progress = enrollment.progress.slice(0, 1);
    const card = enrollmentCard(enrollment);
    expect(card.progress).toBeCloseTo(1 / 3);
    expect(card.completed).toBe(1);
    const stats = grantStatistics(
      enrollment.grants,
      [
        {
          id: enrollment.releaseId,
          course_id: enrollment.course.id,
          version: 1,
          published_at: '2026-01-01',
          manifest: enrollment.course,
        },
      ],
      enrollment.progress,
    );
    expect(stats[0].progress).toBe(card.progress);
  });
  it('keeps completion in dashboard metadata without exposing lesson content or keys', () => {
    const safe = safeEnrollment(demoEnrollment);
    const lesson = safe.course.modules[0].lessons[0];
    expect(lesson.blocks[0]).not.toHaveProperty('body');
    expect(lesson.blocks.at(-1)).not.toHaveProperty('quiz');
    expect(lessonFraction(lesson, demoEnrollment.progress[0].state)).toBe(1);
  });
});
