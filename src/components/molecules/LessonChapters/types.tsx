import type { Lesson } from '@/lib/learning/types';

export type LessonChaptersProps = {
  lesson: Lesson;
  onNavigate?: () => void;
};
