import type { CSSProperties, RefObject } from 'react';
import type { StudioExposureState } from '@/lib/studio-home/types';

export type StudioHomeExposureProps = {
  section: RefObject<HTMLElement | null>;
  exposure: StudioExposureState;
  ready?: boolean;
  compact?: boolean;
};
export type StudioExposureStyle = CSSProperties & {
  '--exposure-progress': number;
  '--mobile-exposure': number;
};
