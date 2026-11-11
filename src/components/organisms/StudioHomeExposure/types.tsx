import type { CSSProperties, RefObject } from 'react';
import type { StudioHomeMode } from '@/lib/studio-home/types';

export type StudioHomeExposureProps = {
  mode: StudioHomeMode;
  directionsRef?: RefObject<HTMLElement | null>;
};
export type StudioExposureStyle = CSSProperties & {
  '--exposure-progress': number;
  '--mobile-exposure': number;
};
