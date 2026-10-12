import { afterEach, describe, expect, it, vi } from 'vitest';
import { createReadingTracker } from '../src/lib/learning/reading';
import { mostVisibleReadingBlock } from '../src/lib/learning/browser';
import { studyBudget } from '../src/lib/learning/progress';
import { applyProgress, lessonFraction } from '../src/lib/learning/progress';
import { safeEnrollment } from '../src/lib/learning/service';
import { demoEnrollment } from '../src/lib/learning/demo';
import type { ReadingObservation, LessonProgress } from '../src/lib/learning/types';

afterEach(() => vi.unstubAllGlobals());
describe('reading observation windows', () => {
  it('keeps completion identity in dashboard metadata without exposing paid lesson content', () => {
    const enrollment = structuredClone(demoEnrollment);
    const lesson = enrollment.course.modules[0].lessons[0];
    lesson.blocks = [
      {
        id: 'photo',
        kind: 'image',
        title: 'Protected image',
        required: true,
        revision: 1,
        mediaId: 'private-id',
        alt: 'Private caption',
        expectedSeconds: 5,
      },
    ];
    const state = applyProgress(
      lesson,
      { blocks: {} },
      { id: 'e', sessionId: 's', sequence: 1, blockId: 'photo', revision: 1, elapsed: 5 },
      5,
    );
    const stripped = safeEnrollment(enrollment).course.modules[0].lessons[0];
    expect(stripped.blocks[0]).not.toHaveProperty('alt');
    expect(lessonFraction(stripped, state)).toBe(lessonFraction(lesson, state));
    expect(lessonFraction(stripped, state)).toBe(1);
  });
  it('preserves short visits when moving between materials without overlapping their timestamps', () => {
    const samples: ReadingObservation[] = [];
    const first = createReadingTracker((s) => samples.push(s), 10, 0);
    const second = createReadingTracker((s) => samples.push(s), 10, 0);
    for (let time = 1000; time <= 8000; time += 1000) {
      first.tick(time, time <= 4000 ? [0, 1, 2] : null);
      second.tick(time, time > 4000 ? [3, 4, 5] : null);
    }
    second.flush();
    expect(samples.map((s) => s.elapsed)).toEqual([4, 4]);
    expect(samples.map((s) => s.observedAt)).toEqual([
      new Date(4000).toISOString(),
      new Date(8000).toISOString(),
    ]);
    let state: LessonProgress = { blocks: {} };
    const credited = samples.map((sample, i) => {
      const budget = studyBudget(
        state,
        { ...sample, id: String(i), sessionId: 's', sequence: i, blockId: 'b', revision: 1 },
        60000,
      );
      state = { ...state, studyRanges: budget.ranges };
      return budget.elapsed;
    });
    expect(credited).toEqual([4, 4]);
  });
  it('flushes at the last active observation and excludes background or sleep time', () => {
    const report = vi.fn();
    const tracker = createReadingTracker(report, 10, 0);
    tracker.tick(1000, [5]);
    tracker.tick(2000, [6]);
    tracker.tick(60000, [7]);
    tracker.tick(61000, null);
    tracker.flush();
    expect(report).toHaveBeenCalledExactlyOnceWith({
      elapsed: 2,
      observedAt: new Date(2000).toISOString(),
      coverage: [5, 6],
    });
  });
  it('does not double-count repeated flushes or concurrent tab windows', () => {
    const report = vi.fn();
    const tracker = createReadingTracker(report, 2, 0);
    tracker.tick(1000, [1]);
    tracker.tick(2000, [1]);
    tracker.flush();
    tracker.flush();
    expect(report).toHaveBeenCalledTimes(1);
    const event = {
      ...report.mock.calls[0][0],
      id: 'event',
      sessionId: 'tab',
      sequence: 1,
      blockId: 'b',
      revision: 1,
    };
    const first = studyBudget({ blocks: {} }, event, 10000);
    expect(studyBudget({ blocks: {}, studyRanges: first.ranges }, event, 10000).elapsed).toBe(0);
  });
  it('lets an adjacent image receive inspection time after the first one completes', () => {
    const first = {
      dataset: { readingComplete: 'true' },
      getBoundingClientRect: () => ({ top: 100, bottom: 500 }),
    };
    const second = {
      dataset: { readingComplete: 'false' },
      getBoundingClientRect: first.getBoundingClientRect,
    };
    vi.stubGlobal('document', {
      querySelector: () => null,
      querySelectorAll: () => [first, second],
    });
    vi.stubGlobal('innerHeight', 800);
    expect(mostVisibleReadingBlock()?.element).toBe(second);
  });
  it('credits only the open photo and excludes the lesson behind a modal', () => {
    const background = { dataset: {}, getBoundingClientRect: () => ({ top: 80, bottom: 700 }) };
    const photo = { dataset: {}, getBoundingClientRect: () => ({ top: 150, bottom: 650 }) };
    const modal = { querySelectorAll: () => [photo] };
    vi.stubGlobal('document', {
      querySelector: () => modal,
      querySelectorAll: () => [background, photo],
    });
    vi.stubGlobal('innerHeight', 800);
    expect(mostVisibleReadingBlock()?.element).toBe(photo);
    photo.dataset = { readingComplete: 'true' };
    expect(mostVisibleReadingBlock()).toBeUndefined();
  });
  it('does not accumulate background reading while a non-reading dialog is open', () => {
    vi.stubGlobal('document', { querySelector: () => ({ querySelectorAll: () => [] }) });
    expect(mostVisibleReadingBlock()).toBeUndefined();
  });
});
