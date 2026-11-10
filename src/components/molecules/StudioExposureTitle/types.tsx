import type { CSSProperties } from 'react';

export type StudioExposureTitleProps = {
  progress: number;
  transition: number;
  ready: boolean;
};
export type ExposureWordPoint = { x: number; y: number };
export type ExposureWordPosition = {
  source: ExposureWordPoint;
  target: ExposureWordPoint;
};
export type ExposureTitleLayout = {
  words: ExposureWordPosition[];
  mobile: boolean;
  reducedMotion: boolean;
  eligible: boolean;
};
export type ExposureWordBounds = { left: number; top: number; width: number };
export type ExposureTitleStyle = CSSProperties & { '--removed-opacity': number };
