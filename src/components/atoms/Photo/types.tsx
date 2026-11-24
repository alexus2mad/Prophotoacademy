import type { ImageAsset } from '@/lib/content/types';
export type PhotoProps = {
  image: Pick<ImageAsset, 'src' | 'alt' | 'width' | 'height' | 'position' | 'fit'>;
  priority?: boolean;
  eager?: boolean;
  className?: string;
  natural?: boolean;
  sizes?: string;
};
