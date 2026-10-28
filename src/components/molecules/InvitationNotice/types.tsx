import type { InvitationStatus } from '@/lib/notifications/types';

export type InvitationNoticeProps = {
  email: string;
  audience: 'student' | 'admin';
  invitation?: InvitationStatus;
  demo?: boolean;
};
