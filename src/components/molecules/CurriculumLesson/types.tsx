import type { Lesson } from '@/lib/learning/types';

export type CurriculumLessonProps = {
  lesson: Lesson;
  label: string;
  href: string;
  available: boolean;
  complete: boolean;
  current: boolean;
  currentChapterId?: string;
  onNavigate?: () => void;
};
