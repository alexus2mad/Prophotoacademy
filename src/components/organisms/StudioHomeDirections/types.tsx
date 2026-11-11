import type { StudioHomeDirection, StudioHomeMode } from '@/lib/studio-home/types';
export type StudioHomeDirectionsProps = {
  mode: StudioHomeMode;
  directions: StudioHomeDirection[];
};

export type DirectionRailDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  dragging: boolean;
};
