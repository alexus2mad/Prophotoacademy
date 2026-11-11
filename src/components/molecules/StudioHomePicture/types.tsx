import type { StudioAsset } from '@/lib/studio-design/types';
import type { StudioImageProps } from '@/components/atoms/StudioImage/types';

export type StudioHomePictureProps = {
  image: StudioAsset;
  mobileImage?: StudioAsset;
  alt: string;
  className?: string;
  eager?: boolean;
  fetchPriority?: StudioImageProps['fetchPriority'];
  sizes?: string;
};
