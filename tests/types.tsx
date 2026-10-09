export type SerializedRow = { data: string };
export type CountRow = { count: number };
export type OutboxStateRow = { state: string };
export type OutboxLeaseRow = { attempts: number; claim_until: number };
export type AccessChangeInput = {
  action: 'grant' | 'revoke' | 'restore';
  grantId: string;
  email: string;
  courseId: string;
  releaseId: string;
  lessonIds: string[];
  packageName: string;
  expiresAt: string | null;
  reason: string;
};
