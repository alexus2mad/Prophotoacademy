import type { Lesson } from '@/lib/learning/types';
export type LessonSettingsProps = {
  lesson: Lesson;
  number?: number;
  onChange: (change: Partial<Omit<Lesson, 'id'>>) => void;
};
