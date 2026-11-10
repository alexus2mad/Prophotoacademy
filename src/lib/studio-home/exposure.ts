import type { StudioExposureGeometry, StudioExposureState } from './types';

export const exposureBarCount = 33;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const formatValue = (value: number) =>
  `${value > 0.04 ? `+${value.toFixed(1)}` : value < -0.04 ? `−${Math.abs(value).toFixed(1)}` : '0.0'} EV`;

// Photo, title and meter share one reversible sticky-stage timeline on every screen.
export function studioExposureState({
  top,
  height,
  stageHeight,
  stickyOffset = 0,
  reducedMotion,
}: StudioExposureGeometry): StudioExposureState {
  const runway = height - stageHeight;
  const progress = reducedMotion ? 1 : clamp((stickyOffset - top) / Math.max(1, runway * 0.8));
  return studioExposureAtProgress(progress);
}

export function studioExposureAtProgress(value: number): StudioExposureState {
  const progress = clamp(value);
  const activeBars = Math.round(progress * exposureBarCount);
  return {
    // Keep subpixel scroll precision for word transforms; only the EV label rounds.
    progress,
    activeBars,
    redBars: Math.max(0, activeBars - (exposureBarCount - 6)),
    redStart: exposureBarCount - 6,
    value: formatValue(-3 * (1 - progress)),
  };
}

/** A shared, frame-rate-independent response keeps the photograph, words and meter together. */
export function smoothExposureProgress(current: number, target: number, elapsedMs: number) {
  const destination = clamp(target);
  const next =
    destination + (clamp(current) - destination) * Math.exp(-Math.max(0, elapsedMs) / 120);
  return Math.abs(destination - next) <= 0.0001 ? destination : next;
}
