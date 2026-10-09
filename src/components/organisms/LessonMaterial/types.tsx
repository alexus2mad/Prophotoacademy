import type { LessonBlockProps, LiveSession } from '@/lib/learning/types';
export type LessonMaterialProps = LessonBlockProps & { sessions: LiveSession[] };
