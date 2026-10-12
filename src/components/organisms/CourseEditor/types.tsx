import type { CourseDraft, Lesson, LearningBlock } from '@/lib/learning/types';
import type { CourseEditorData } from '@/lib/admin/types';
export type CourseEditorProps = { initial: CourseDraft; data: CourseEditorData; demo?: boolean };
export type LessonChange = Partial<Omit<Lesson, 'id'>>;
export type BlockChange = Partial<Omit<LearningBlock, 'id' | 'revision'>>;
export type DraftUpdate = CourseDraft | ((draft: CourseDraft) => CourseDraft);
export type EditorSection = 'content' | 'packages' | 'sessions';
