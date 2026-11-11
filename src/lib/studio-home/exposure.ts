import type {
  StudioCompactExposureGeometry,
  StudioExposureGeometry,
  StudioExposureState,
} from './types';

export const exposureBarCount = 33;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const formatValue = (value: number) =>
  `${value > 0.04 ? `+${value.toFixed(1)}` : value < -0.04 ? `−${Math.abs(value).toFixed(1)}` : '0.0'} EV`;

// Desktop photo, title and meter share one reversible sticky-stage timeline.
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

/** The compact artifact follows its section through the viewport without a sticky runway. */
export function studioCompactExposureState({
  top,
  height,
  viewportHeight,
  reducedMotion,
}: StudioCompactExposureGeometry): StudioExposureState {
  const progress = reducedMotion
    ? top + height < viewportHeight * 0.6
      ? 1
      : 0
    : clamp((viewportHeight * 0.55 - top) / Math.max(1, height + viewportHeight * 0.2));
  return studioCompactExposureAtProgress(progress, reducedMotion);
}

export function studioCompactExposureAtProgress(
  value: number,
  reducedMotion = false,
): StudioExposureState {
  const progress = clamp(value);
  const white = reducedMotion ? 1 : clamp(progress / 0.45);
  const red = reducedMotion ? (progress >= 1 ? 1 : 0) : clamp((progress - 0.45) / 0.35);
  return {
    progress,
    activeBars: Math.round(white * exposureBarCount),
    redBars: Math.round(red * exposureBarCount),
    redStart: 0,
    value: formatValue((3 * (white + red)) / 2),
  };
}

/** A shared, frame-rate-independent response keeps the photograph, words and meter together. */
export function smoothExposureProgress(current: number, target: number, elapsedMs: number) {
  const destination = clamp(target);
  const next =
    destination + (clamp(current) - destination) * Math.exp(-Math.max(0, elapsedMs) / 120);
  return Math.abs(destination - next) <= 0.0001 ? destination : next;
}
