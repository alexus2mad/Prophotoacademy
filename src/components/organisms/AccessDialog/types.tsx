import type { RefObject } from 'react';
import type { CourseRelease, Grant } from '@/lib/learning/types';
export type AccessAction = 'grant' | 'extend' | 'upgrade' | 'migrate' | 'revoke' | 'restore';
export type AccessDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  email: string;
  courses: CourseRelease[];
  grant?: Grant;
  initialAction: AccessAction;
  demo?: boolean;
  onSaved: () => void;
};
