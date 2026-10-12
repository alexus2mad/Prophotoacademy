import type { LearningBlock, LessonProgress, ProgressSample } from '@/lib/learning/types';
export type LessonImageViewerProps = {
  images: LearningBlock[];
  initialIndex: number;
  courseId: string;
  lessonId: string;
  progress?: LessonProgress;
  demo?: boolean;
  preview?: boolean;
  onProgress: (sample: ProgressSample) => void;
  onClose: () => void;
};
