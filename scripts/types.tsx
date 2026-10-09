import type seed from '../content/academy.json';

export type SourceImage = (typeof seed.images)[number] & {
  sourceUrl?: string;
  bytes?: number;
  originalWidth?: number;
  originalHeight?: number;
};
export type MigrationDocument = { _id: string; _type: string };
