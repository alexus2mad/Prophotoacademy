import type { CSSProperties } from 'react';
import type { StudioHomeDirection, StudioHomeMode } from '@/lib/studio-home/types';
export type StudioHomeDirectionsProps = {
  mode: StudioHomeMode;
  directions: StudioHomeDirection[];
  transitionProgress?: number;
};
export type StudioDirectionTransitionStyle = CSSProperties & { '--mobile-exposure': number };
