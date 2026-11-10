import type { CSSProperties, RefObject } from 'react';
import type { StudioExposureState } from '@/lib/studio-home/types';

export type StudioHomeExposureProps = {
  section: RefObject<HTMLElement | null>;
  exposure: StudioExposureState;
  ready?: boolean;
};
export type StudioExposureStyle = CSSProperties & {
  '--exposure-progress': number;
  '--exposure-transition': number;
};
