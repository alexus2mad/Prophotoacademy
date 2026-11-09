import type { CSSProperties } from 'react';
import type { StudioAsset } from '@/lib/studio-design/types';

export type StudioImageProps = {
  asset: StudioAsset;
  alt: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
  eager?: boolean;
  fit?: 'cover' | 'contain';
  position?: string;
  style?: CSSProperties;
};
