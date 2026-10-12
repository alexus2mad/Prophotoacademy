import type { LearningBlock, Lesson, LessonProgress, LessonQuiz, QuizResult } from './types';

export function publicLearningBlock(block: LearningBlock): LearningBlock {
  if (!block.quiz) return block;
  return {
    ...block,
    quiz: {
      ...block.quiz,
      questions: block.quiz.questions.map(({ id, prompt, options }) => ({ id, prompt, options })),
    },
  };
}

export function gradeQuiz(
  quiz: LessonQuiz,
  answers: Record<string, string>,
  attemptId: string,
): QuizResult {
  if (
    !quiz.questions.length ||
    Object.keys(answers).length !== quiz.questions.length ||
    quiz.questions.some((q) => !q.correctOptionId || !q.options.some((o) => o.id === answers[q.id]))
  )
    throw new Error('Оберіть одну відповідь на кожне запитання');
  const feedback = quiz.questions.map((q) => ({
    questionId: q.id,
    correct: answers[q.id] === q.correctOptionId,
    correctOptionId: q.correctOptionId,
    explanation: q.explanation || '',
  }));
  const correct = feedback.filter((f) => f.correct).length;
  return {
    attemptId,
    answers,
    correct,
    total: feedback.length,
    passed: correct * 100 >= quiz.passingScore * feedback.length,
    feedback,
  };
}

// Older saved attempts predate answer-level review. Reveal keys only for submitted quizzes.
export function quizReviewProgress(lesson: Lesson, progress: LessonProgress): LessonProgress {
  const blocks = { ...progress.blocks };
  for (const block of lesson.blocks) {
    const state = blocks[block.id];
    if (!block.quiz || !state?.quiz || state.revision !== block.revision) continue;
    blocks[block.id] = {
      ...state,
      quiz: {
        ...state.quiz,
        feedback: state.quiz.feedback.map((feedback) => ({
          ...feedback,
          correctOptionId: block.quiz!.questions.find((q) => q.id === feedback.questionId)
            ?.correctOptionId,
        })),
      },
    };
  }
  return { ...progress, blocks };
}
