import type { LessonQuiz } from '@/lib/learning/types';
export type QuizEditorProps = { quiz: LessonQuiz; onChange: (quiz: LessonQuiz) => void };
