import { describe, expect, it } from 'vitest';
import { historicalQuizCompletion } from '../src/lib/learning/progress-migration';
import { gradeQuiz } from '../src/lib/learning/quiz';
import { applyProgress, lessonFraction } from '../src/lib/learning/progress';
import { demoCourse } from '../src/lib/learning/demo';
import { hasFinalQuiz } from '../src/lib/learning/presentation';
import type { CourseRelease, ProgressRow } from '../src/lib/learning/types';

const lesson = demoCourse.modules[0].lessons[0];
const quiz = lesson.blocks.at(-1)!;
const release: CourseRelease = {
  id: 'r',
  course_id: demoCourse.id,
  version: 1,
  published_at: '2026-01-01',
  manifest: demoCourse,
};
const row: ProgressRow = {
  user_id: 'synthetic',
  course_id: demoCourse.id,
  lesson_id: lesson.id,
  state: {
    blocks: {
      [quiz.id]: {
        revision: 1,
        position: 0,
        completed: true,
        quiz: gradeQuiz(quiz.quiz!, { completion: 'quiz' }, 'old-pass'),
      },
    },
  },
  completed_at: null,
  completion_source: null,
  updated_at: '2026-10-10T12:00:00Z',
};
describe('quiz completion migration and publication', () => {
  it('recovers a saved pass even when the old weighted lesson never reached 100%', () => {
    expect(historicalQuizCompletion(row, [release])).toMatchObject({
      attemptId: 'old-pass',
      source: 'legacy-passing-result',
    });
  });
  it('preserves an earlier pass followed by a verified failed retry', () => {
    const old = structuredClone(row);
    old.state.blocks[quiz.id].quiz = gradeQuiz(
      quiz.quiz!,
      { completion: 'scroll' },
      'failed-retry',
    );
    expect(historicalQuizCompletion(old, [release])).toMatchObject({
      attemptId: null,
      source: 'legacy-pass-latch',
    });
    old.state.blocks[quiz.id].completed = false;
    expect(historicalQuizCompletion(old, [release])).toBeUndefined();
  });
  it('never migrates reading, attendance, manual flags, unknown revisions or fabricated results', () => {
    const manual = {
      ...row,
      state: { blocks: {}, manual: 'student' as const },
      completed_at: row.updated_at,
    };
    expect(historicalQuizCompletion(manual, [release])).toBeUndefined();
    for (const change of [
      { revision: 999 },
      { quiz: { ...row.state.blocks[quiz.id].quiz!, correct: 0 } },
    ]) {
      const old = structuredClone(row);
      Object.assign(old.state.blocks[quiz.id], change);
      expect(historicalQuizCompletion(old, [release])).toBeUndefined();
    }
  });
  it('retains historical completion across replaced quizzes and unsuccessful attempts', () => {
    const completion = historicalQuizCompletion(row, [release])!;
    const next = { ...lesson, blocks: [{ ...quiz, revision: 2 }] };
    const state = applyProgress(
      next,
      { blocks: {}, quizCompletion: completion },
      {
        id: 'new-fail',
        sessionId: 's',
        sequence: 1,
        kind: 'quiz',
        blockId: quiz.id,
        revision: 2,
        quizAnswers: { completion: 'scroll' },
      },
    );
    expect(lessonFraction(next, state)).toBe(1);
    expect(state.quizCompletion).toEqual(completion);
  });
  it('requires exactly one nonempty final quiz', () => {
    expect(hasFinalQuiz(lesson)).toBe(true);
    expect(hasFinalQuiz({ ...lesson, blocks: lesson.blocks.slice(0, -1) })).toBe(false);
    expect(hasFinalQuiz({ ...lesson, blocks: [quiz, ...lesson.blocks] })).toBe(false);
    expect(hasFinalQuiz({ ...lesson, blocks: [quiz, lesson.blocks[0]] })).toBe(false);
    expect(
      hasFinalQuiz({ ...lesson, blocks: [{ ...quiz, quiz: { passingScore: 80, questions: [] } }] }),
    ).toBe(false);
  });
});
