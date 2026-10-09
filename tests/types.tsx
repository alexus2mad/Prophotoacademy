export type SerializedRow = { data: string };
export type CountRow = { count: number };
export type OutboxStateRow = { state: string };
export type OutboxLeaseRow = { attempts: number; claim_until: number };
