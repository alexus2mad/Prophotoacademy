import type { LearningBlock } from '@/lib/learning/types';
export type LessonBlockEditorProps = {
  block: LearningBlock;
  courseId: string;
  demo?: boolean;
  onChange: (change: Partial<Omit<LearningBlock, 'id' | 'revision'>>) => void;
  onDelete: () => void;
  onMove: (direction: number) => void;
  first: boolean;
  last: boolean;
};

export type UploadSessionReply = {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
};
export type UploadStatusReply = { status: string; duration?: number };
