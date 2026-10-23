import type { ImageAsset } from '@/lib/content/types';
export type PhotoProps = {
  image: ImageAsset;
  priority?: boolean;
  eager?: boolean;
  className?: string;
  natural?: boolean;
  sizes?: string;
};
