import type { UserDetail } from '@/lib/admin/types';
import type { Grant } from '@/lib/learning/types';
import type { AccessAction } from '@/components/organisms/AccessDialog/types';
export type StudentDetailProps = { detail: UserDetail; demo?: boolean };
export type AccessEditing = { key: number; grant?: Grant; action: AccessAction };
