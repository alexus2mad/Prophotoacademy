import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import type { CSSProperties, RefObject } from 'react';

export type StudioHomeExposureProps = BrandContentProps & {
  directionsRef?: RefObject<HTMLElement | null>;
};
export type StudioExposureStyle = CSSProperties & {
  '--exposure-progress': number;
  '--mobile-exposure': number;
};
