import type { ImageAsset } from '@/lib/content/types';
export type PreparedPhotoProps = {
  image: ImageAsset;
  priority?: boolean;
  eager?: boolean;
  sizes: string;
};
