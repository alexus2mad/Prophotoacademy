import type { EnrolledCourse, LessonProgress } from '@/lib/learning/types';
export type CourseCurriculumProps = {
  enrollment: EnrolledCourse;
  lessonId: string;
  currentProgress: LessonProgress;
  currentChapterId?: string;
  demo?: boolean;
  onNavigate?: () => void;
};
