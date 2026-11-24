import type { SitePageKind } from '../types';

export type SyncStatus = 'new' | 'changed';
export type SyncChanges = {
  title: boolean;
  added: string[];
  removed: string[];
  changed: string[];
};
export type SyncTicket = { label: string; price: number };
export type SyncCandidate = {
  path: string;
  title: string;
  kind: SitePageKind;
  status: SyncStatus;
  changes: SyncChanges;
  /** Photos the production marketing project does not hold yet. */
  photos: number;
  productionDraft: boolean;
  ticket?: SyncTicket;
  stagingDigest: string;
  revision: string | null;
  /** Why the page cannot be synced, when it fails production checks before publication. */
  problem?: string;
};
export type SyncOverview = { candidates: SyncCandidate[]; identical: number };
export type SyncAddresses = {
  fromImages: string;
  toImages: string;
  fromOrigin: string;
  toOrigin: string;
};
export type StagingRecord = { path: string; page: unknown };
export type StagingAsset = { _id: string; originalFilename?: string };
