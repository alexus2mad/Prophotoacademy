import type { StudioAsset } from '@/lib/studio-design/types';

export type StudioHomePictureProps = {
  image: StudioAsset;
  mobileImage?: StudioAsset;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
};
