import { describe, expect, it } from 'vitest';
import { gradeQuiz, publicLearningBlock } from '../src/lib/learning/quiz';
import { applyProgress, lessonFraction } from '../src/lib/learning/progress';
import { blockSchema, progressSchema } from '../src/lib/learning/schema';
import { lessonBlockGroups } from '../src/lib/learning/presentation';
import type { LearningBlock, Lesson, ProgressEvent } from '../src/lib/learning/types';

const block: LearningBlock = {
  id: 'quiz',
  kind: 'quiz',
  title: 'Test',
  required: true,
  revision: 1,
  quiz: {
    passingScore: 80,
    questions: [
      {
        id: 'question',
        prompt: 'Choose the matching shape',
        options: [
          { id: 'circle', text: 'Circle' },
          { id: 'square', text: 'Square' },
        ],
        correctOptionId: 'circle',
        explanation: 'The sample is round',
      },
    ],
  },
};
const lesson: Lesson = { id: 'lesson', title: 'Example', summary: '', blocks: [block] };
const event: ProgressEvent = {
  id: 'attempt',
  sessionId: 'session',
  sequence: 1,
  blockId: 'quiz',
  revision: 1,
  elapsed: 0,
  quizAnswers: { question: 'circle' },
};

describe('lesson self-checks', () => {
  it('withholds keys and explanations until submission without mutating the source', () => {
    const safe = publicLearningBlock(block);
    expect(safe.quiz?.questions[0]).not.toHaveProperty('correctOptionId');
    expect(safe.quiz?.questions[0]).not.toHaveProperty('explanation');
    expect(safe.quiz?.questions[0].options).toHaveLength(2);
    expect(block.quiz?.questions[0].correctOptionId).toBe('circle');
  });
  it('grades an attempt and returns useful review feedback', () => {
    expect(gradeQuiz(block.quiz!, { question: 'square' }, 'attempt')).toMatchObject({
      correct: 0,
      total: 1,
      passed: false,
      feedback: [{ correct: false, explanation: 'The sample is round' }],
    });
    expect(gradeQuiz(block.quiz!, { question: 'circle' }, 'attempt').passed).toBe(true);
  });
  it('rejects unanswered, extra and fabricated options, or a missing answer key', () => {
    const invalidAnswers: Record<string, string>[] = [
      {},
      { question: 'fake' },
      { question: 'circle', extra: 'circle' },
    ];
    for (const answers of invalidAnswers)
      expect(() => gradeQuiz(block.quiz!, answers, 'attempt')).toThrow();
    expect(() =>
      gradeQuiz(publicLearningBlock(block).quiz!, { question: 'circle' }, 'attempt'),
    ).toThrow();
  });
  it('stores results, retains a passed completion through replay and resets replaced quizzes', () => {
    const passed = applyProgress(lesson, { blocks: {} }, event, 0);
    expect(lessonFraction(lesson, passed)).toBe(1);
    const replay = applyProgress(
      lesson,
      passed,
      { ...event, id: 'retry', quizAnswers: { question: 'square' } },
      0,
    );
    expect(replay.blocks.quiz.quiz?.passed).toBe(false);
    expect(lessonFraction(lesson, replay)).toBe(1);
    expect(lessonFraction({ ...lesson, blocks: [{ ...block, revision: 2 }] }, replay)).toBe(0);
  });
  it('cannot complete a required quiz through time, client flags or manual reading confirmation', () => {
    const observed = applyProgress(
      lesson,
      { blocks: {} },
      { ...event, elapsed: 30, quizAnswers: undefined },
      30,
    );
    expect(lessonFraction(lesson, observed)).toBe(0);
    const manual = applyProgress(lesson, observed, { ...event, manual: true }, 0);
    expect(lessonFraction(lesson, manual)).toBe(0);
    expect(
      progressSchema.parse({
        ...event,
        id: crypto.randomUUID(),
        sessionId: crypto.randomUUID(),
        completed: true,
      }),
    ).not.toHaveProperty('completed');
  });
  it('rejects duplicate question and option identities', () => {
    expect(
      blockSchema.safeParse({
        ...block,
        quiz: { ...block.quiz, questions: [...block.quiz!.questions, ...block.quiz!.questions] },
      }).success,
    ).toBe(false);
    expect(
      blockSchema.safeParse({
        ...block,
        quiz: {
          ...block.quiz,
          questions: [
            {
              ...block.quiz!.questions[0],
              options: [
                { id: 'same', text: 'A' },
                { id: 'same', text: 'B' },
              ],
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
  it('groups adjacent images while preserving reading order and independent progress IDs', () => {
    const image = { ...block, kind: 'image' as const };
    expect(
      lessonBlockGroups([
        { ...image, id: 'a' },
        { ...image, id: 'b' },
        { ...image, id: 'c' },
        block,
      ]).map((g) => g.map((b) => b.id)),
    ).toEqual([['a', 'b'], ['c'], ['quiz']]);
  });
});
