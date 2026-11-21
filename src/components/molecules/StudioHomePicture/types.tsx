import type { StudioAsset } from '@/lib/studio-design/types';
import type { StudioImageProps } from '@/components/atoms/StudioImage/types';

export type StudioHomePictureProps = {
  image: StudioAsset;
  fieldId?: string;
  mobileFieldId?: string;
  mobileImage?: StudioAsset;
  alt: string;
  className?: string;
  eager?: boolean;
  fetchPriority?: StudioImageProps['fetchPriority'];
  sizes?: string;
};
