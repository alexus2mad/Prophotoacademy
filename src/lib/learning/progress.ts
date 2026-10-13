import type { Lesson, LessonProgress, BlockProgress, ProgressEvent } from './types';
import { gradeQuiz } from './quiz';

// Completion belongs to the lesson, independently of later content/quiz revisions.
export function lessonFraction(_lesson: Lesson, state: LessonProgress) {
  return state.quizCompletion ? 1 : 0;
}

export function applyProgress(
  lesson: Lesson,
  previous: LessonProgress,
  event: ProgressEvent,
): LessonProgress {
  // Acknowledge old monitoring queues without awarding credit or altering historical data.
  if (event.manual || (!event.quizAnswers && event.kind !== 'resume')) return previous;
  const block = lesson.blocks.find((b) => b.id === event.blockId && b.revision === event.revision);
  if (!block) throw new Error('Матеріал змінився. Оновіть урок');
  const current = previous.blocks[block.id];
  const state: BlockProgress =
    current?.revision === block.revision
      ? structuredClone(current)
      : { revision: block.revision, mediaId: block.mediaId, position: 0 };
  let quizCompletion = previous.quizCompletion;
  if (event.quizAnswers) {
    if (block.kind !== 'quiz' || !block.quiz) throw new Error('Тест змінився. Оновіть урок');
    state.quiz = gradeQuiz(block.quiz, event.quizAnswers, event.id);
    if (state.quiz.passed && !quizCompletion)
      quizCompletion = {
        quizId: block.id,
        revision: block.revision,
        attemptId: event.id,
        completedAt: new Date().toISOString(),
        source: 'submission',
      };
  } else if (event.position !== undefined) {
    state.position = Math.max(0, Math.min(event.position, block.duration || 86400));
  }
  return {
    ...previous,
    quizCompletion,
    lastBlockId: block.id,
    blocks: { ...previous.blocks, [block.id]: state },
  };
}
