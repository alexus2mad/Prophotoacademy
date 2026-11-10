import type { CSSProperties } from 'react';
import type { StudioHomeDirection, StudioHomeMode } from '@/lib/studio-home/types';
export type StudioHomeDirectionsProps = {
  mode: StudioHomeMode;
  directions: StudioHomeDirection[];
  transition?: number;
};
export type StudioDirectionsStyle = CSSProperties & { '--exposure-transition'?: number };
