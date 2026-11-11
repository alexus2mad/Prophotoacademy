import type { RefObject } from 'react';
import type { StudioHomeDirection, StudioHomeMode } from '@/lib/studio-home/types';
export type StudioHomeDirectionsProps = {
  mode: StudioHomeMode;
  directions: StudioHomeDirection[];
  sectionRef?: RefObject<HTMLElement | null>;
};
