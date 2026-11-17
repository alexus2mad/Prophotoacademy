import type { CSSProperties, RefObject } from 'react';

export type StudioHomeExposureProps = {
  directionsRef?: RefObject<HTMLElement | null>;
};
export type StudioExposureStyle = CSSProperties & {
  '--exposure-progress': number;
  '--mobile-exposure': number;
};
