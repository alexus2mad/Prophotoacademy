import type { DatabaseSync } from 'node:sqlite';
import type { Acquisition } from '../attribution/types';
import type { AccessSnapshot } from '../learning/types';
import type { PaymentMode } from '../commerce/types';
import type { PackageKind } from '../content/types';
export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'canceled'
  | 'refunded'
  | 'enrolled';
export type Order = {
  id: string;
  tokenHash: string;
  idempotencyKey: string;
  fingerprint: string;
  offeringId: string;
  packageId: string;
  programId?: string;
  programTitle: string;
  packageName: string;
  amount: number;
  currency: string;
  customer: { name: string; email: string; phone: string; telegram?: string; instagram?: string };
  productKind?: PackageKind;
  promoCode?: string;
  discountPercent?: number;
  status: OrderStatus;
  mode: PaymentMode;
  listAmount?: number;
  createdAt: number;
  acquisition?: Acquisition;
  fulfillment?: AccessSnapshot;
  merchantAccount?: string;
};
export type LedgerGlobals = { academyDatabases?: Map<string, DatabaseSync> };
export type ColumnRecord = { name: string };
export type SerializedRecord = { data: string };
export type RateLimitRecord = { count: number };
export type OutboxJob = { id: string; kind: string; data: string; attempts: number };
