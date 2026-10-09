import type { DialogHTMLAttributes, ReactNode, RefObject } from 'react';

export type DialogProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, 'children'> & {
  dialogRef: RefObject<HTMLDialogElement | null>;
  children: ReactNode;
  closeLabel: string;
  closeOnBackdrop?: boolean;
  closeIconSize?: number;
};
