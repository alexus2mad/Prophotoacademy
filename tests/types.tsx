export type SerializedRow = { data: string };
export type OrderRow = { data: import('../src/lib/ledger/types').Order };
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
export type OutboxEventRow = { id: string; kind: string; data: Record<string, unknown> };
export type AdminAuthState = { role: 'admin' | 'student'; fresh: boolean };
export type GrantRevocationRow = { revoked_at: string | null };
