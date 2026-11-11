import type { CSSProperties } from 'react';
import type { ImageProps } from 'next/image';
import type { StudioAsset } from '@/lib/studio-design/types';

export type StudioImageProps = {
  asset: StudioAsset;
  alt: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
  eager?: boolean;
  fetchPriority?: ImageProps['fetchPriority'];
  fit?: 'cover' | 'contain';
  position?: string;
  style?: CSSProperties;
};
