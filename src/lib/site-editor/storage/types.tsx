import type { SitePage } from '../types';

export type PageState = {
  path: string;
  published: SitePage | null;
  draft: SitePage | null;
  revision: string | null;
};

export type PublicDocument = {
  _id: string;
  _rev: string;
  _type: string;
  page: SitePage | null;
  path: string;
};

export type LocalRecord = {
  path: string;
  published: string | null;
  draft: string | null;
  revision: string;
};
