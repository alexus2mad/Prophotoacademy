import type { Lesson, LessonProgress, LiveSession, ProgressSample } from '@/lib/learning/types';
export type LessonBodyProps = {
  lesson: Lesson;
  courseId: string;
  number?: number;
  moduleTitle?: string;
  progress?: LessonProgress;
  sessions: LiveSession[];
  demo?: boolean;
  preview?: boolean;
  onProgress: (sample: ProgressSample) => void;
};
