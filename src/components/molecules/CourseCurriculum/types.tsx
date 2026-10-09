import type { EnrolledCourse, LessonProgress } from '@/lib/learning/types';
export type CourseCurriculumProps = {
  enrollment: EnrolledCourse;
  lessonId: string;
  currentProgress: LessonProgress;
  demo?: boolean;
  onNavigate?: () => void;
};
