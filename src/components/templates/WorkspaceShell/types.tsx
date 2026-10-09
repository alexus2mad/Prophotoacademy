import type { ReactNode } from 'react';
import type { Member } from '@/lib/auth/types';
export type WorkspaceShellProps = {
  children: ReactNode;
  member: Member;
  demo?: boolean;
  section?: string;
  admin?: boolean;
};
