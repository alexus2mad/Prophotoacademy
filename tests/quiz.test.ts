import { describe, expect, it } from 'vitest';
import { gradeQuiz, publicLearningBlock, quizReviewProgress } from '../src/lib/learning/quiz';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { LessonQuiz } from '../src/components/organisms/LessonQuiz/LessonQuiz';
import { applyProgress, lessonFraction } from '../src/lib/learning/progress';
import { blockSchema, progressSchema } from '../src/lib/learning/schema';
import { lessonBlockGroups } from '../src/lib/learning/presentation';
import { mediaResponse } from '../src/lib/learning/media-response';
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
  it('uses uncached, newly authorized redirects for downloads without accepting a client destination', async () => {
    const response = mediaResponse(
      new Request('https://academy.test/media?download=1&url=https://bad.test'),
      { url: 'https://storage.test/temporary-file' },
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://storage.test/temporary-file');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const json = mediaResponse(new Request('https://academy.test/media'), {
      url: 'https://storage.test/temporary-file',
    });
    expect(await json.json()).toEqual({ url: 'https://storage.test/temporary-file' });
  });
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
      feedback: [{ correct: false, correctOptionId: 'circle', explanation: 'The sample is round' }],
    });
    expect(gradeQuiz(block.quiz!, { question: 'circle' }, 'attempt').passed).toBe(true);
  });
  it('distinguishes the wrong selection from the right answer with color classes and explicit labels', () => {
    const progress = applyProgress(
      lesson,
      { blocks: {} },
      { ...event, quizAnswers: { question: 'square' } },
    );
    const html = renderToStaticMarkup(
      createElement(LessonQuiz, {
        block: publicLearningBlock(block),
        courseId: 'course',
        lessonId: lesson.id,
        state: progress.blocks.quiz,
        onProgress: () => {},
      }),
    );
    const $ = load(html);
    expect($('.quiz-option.is-incorrect').text()).toContain('Ваша відповідь — неправильно');
    expect($('.quiz-option.is-incorrect input').attr('value')).toBe('square');
    expect($('.quiz-option.is-correct input').attr('value')).toBe('circle');
    expect($('.quiz-option.is-correct').text()).toContain('Правильна відповідь');
    expect($('.quiz-result.is-failed')).toHaveLength(1);
  });
  it('enriches older submitted results without revealing keys for new or replaced quizzes', () => {
    const progress = applyProgress(lesson, { blocks: {} }, event);
    delete progress.blocks.quiz.quiz!.feedback[0].correctOptionId;
    expect(quizReviewProgress(lesson, progress).blocks.quiz.quiz?.feedback[0].correctOptionId).toBe(
      'circle',
    );
    expect(progress.blocks.quiz.quiz?.feedback[0].correctOptionId).toBeUndefined();
    expect(quizReviewProgress(lesson, { blocks: {} })).toEqual({ blocks: {} });
    expect(
      quizReviewProgress({ ...lesson, blocks: [{ ...block, revision: 2 }] }, progress).blocks.quiz
        .quiz?.feedback[0].correctOptionId,
    ).toBeUndefined();
  });
  it('ignores manual reading and completes only after a passed quiz', () => {
    const combined = {
      ...lesson,
      blocks: [
        {
          id: 'text',
          kind: 'article' as const,
          title: 'Text',
          body: 'Read',
          expectedSeconds: 30,
          required: true,
          revision: 1,
        },
        block,
      ],
    };
    const manual = applyProgress(combined, { blocks: {} }, { ...event, manual: true });
    expect(lessonFraction(combined, manual)).toBe(0);
    expect(lessonFraction(combined, applyProgress(combined, manual, event))).toBe(1);
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
  it('stores results, retains a passed completion through replay and preserves completion across quiz revisions', () => {
    const passed = applyProgress(lesson, { blocks: {} }, event);
    expect(lessonFraction(lesson, passed)).toBe(1);
    const replay = applyProgress(lesson, passed, {
      ...event,
      id: 'retry',
      quizAnswers: { question: 'square' },
    });
    expect(replay.blocks.quiz.quiz?.passed).toBe(false);
    expect(lessonFraction(lesson, replay)).toBe(1);
    expect(lessonFraction({ ...lesson, blocks: [{ ...block, revision: 2 }] }, replay)).toBe(1);
  });
  it('cannot complete a required quiz through time, client flags or manual reading confirmation', () => {
    const observed = applyProgress(
      lesson,
      { blocks: {} },
      { ...event, elapsed: 30, quizAnswers: undefined },
    );
    expect(lessonFraction(lesson, observed)).toBe(0);
    const manual = applyProgress(lesson, observed, { ...event, manual: true });
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
