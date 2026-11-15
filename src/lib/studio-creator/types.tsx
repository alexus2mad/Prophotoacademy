import type { StudioAsset } from '@/lib/studio-design/types';

export type CreatorLecturer = {
  id: string;
  name: string;
  roles: readonly string[];
  bio?: string;
  portrait?: StudioAsset;
};
