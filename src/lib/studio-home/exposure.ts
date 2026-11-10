import type { StudioExposureGeometry, StudioExposureState } from './types';

export const exposureBarCount = 33;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const rounded = (value: number) => Number(value.toFixed(3));
const formatValue = (value: number) =>
  `${value > 0.04 ? `+${value.toFixed(1)}` : value < -0.04 ? `−${Math.abs(value).toFixed(1)}` : '0.0'} EV`;

// The artifact's drawExpo: desktop exposure, then a two-stage mobile white/red meter.
export function studioExposureState({
  top,
  height,
  viewportHeight,
  mobile,
  reducedMotion,
}: StudioExposureGeometry): StudioExposureState {
  if (mobile) {
    const transition = reducedMotion
      ? Number(top + height < viewportHeight * 0.6)
      : clamp((viewportHeight * 0.55 - top) / Math.max(1, height + viewportHeight * 0.2));
    const white = reducedMotion ? 1 : clamp(transition / 0.45);
    const red = reducedMotion ? Number(transition >= 1) : clamp((transition - 0.45) / 0.35);
    return {
      progress: 1,
      transition: rounded(transition),
      activeBars: Math.round(white * exposureBarCount),
      redBars: Math.round(red * exposureBarCount),
      redStart: 0,
      value: formatValue((3 * (white + red)) / 2),
    };
  }

  const runway = height - viewportHeight;
  const progress = reducedMotion ? 1 : clamp(-top / Math.max(1, runway * 0.8));
  const activeBars = Math.round(progress * exposureBarCount);
  return {
    progress: rounded(progress),
    transition: 0,
    activeBars,
    redBars: Math.max(0, activeBars - (exposureBarCount - 6)),
    redStart: exposureBarCount - 6,
    value: formatValue(-3 * (1 - progress)),
  };
}
