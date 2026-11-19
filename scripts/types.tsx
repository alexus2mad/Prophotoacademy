import type seed from '../content/academy.json';

export type SourceImage = (typeof seed.images)[number] & {
  sourceUrl?: string;
  // The original file name for photographs supplied directly by the academy.
  sourceFile?: string;
  bytes?: number;
  originalWidth?: number;
  originalHeight?: number;
};
export type MigrationDocument = { _id: string; _type: string };
export type LegacyRow = Record<string, string | number | null>;
