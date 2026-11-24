import type { SitePage } from '../types';

export type PageState = {
  path: string;
  published: SitePage | null;
  draft: SitePage | null;
  revision: string | null;
  /** Latest change of either document; absent for local storage. */
  updatedAt?: string | null;
};

export type PublicDocument = {
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt?: string;
  page: SitePage | null;
  path: string;
};

export type LocalRecord = {
  path: string;
  published: string | null;
  draft: string | null;
  revision: string;
};

export type EditorTarget = 'production' | 'staging';
