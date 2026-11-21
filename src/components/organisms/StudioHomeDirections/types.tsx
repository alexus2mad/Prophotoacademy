import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import type { RefObject } from 'react';
import type { StudioHomeDirection } from '@/lib/studio-home/types';
export type StudioHomeDirectionsProps = BrandContentProps & {
  directions: StudioHomeDirection[];
  sectionRef?: RefObject<HTMLElement | null>;
};
