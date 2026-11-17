import type { RefObject } from 'react';
import type { StudioHomeDirection } from '@/lib/studio-home/types';
export type StudioHomeDirectionsProps = {
  directions: StudioHomeDirection[];
  sectionRef?: RefObject<HTMLElement | null>;
};
