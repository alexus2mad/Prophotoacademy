import type { CourseEditorData } from '@/lib/admin/types';
export type CourseSessionsProps = { courseId: string; data: CourseEditorData; demo?: boolean };
export type RosterPerson = { id: string; email: string; name: string; attended: boolean };
