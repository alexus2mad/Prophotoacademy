import type { LearningView, ProgressEvent } from '@/lib/learning/types';
export type LessonPlayerProps = { view: LearningView; userId: string; demo?: boolean };
export type ProgressQueue = { sessionId: string; sequence: number; events: ProgressEvent[] };
