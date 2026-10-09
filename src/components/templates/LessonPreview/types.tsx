import type { CourseDraft, Lesson, LiveSession } from '@/lib/learning/types';
export type LessonPreviewProps = {
  course: CourseDraft;
  lesson: Lesson;
  sessions: LiveSession[];
  demo?: boolean;
};
