import type { ExposureWordBounds, ExposureWordPosition } from './types';

const ease = (value: number, start: number, end: number) => {
  const progress = Math.max(0, Math.min(1, (value - start) / (end - start)));
  // Quintic easing also brings acceleration to zero at each phase boundary.
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
};

export function exposureTitlePhase(progress: number) {
  return {
    removedOpacity: 1 - ease(progress, 0.5, 0.68),
    horizontal: ease(progress, 0.68, 0.82),
    vertical: ease(progress, 0.82, 0.96),
  };
}

export function exposureWordTranslation(position: ExposureWordPosition, progress: number) {
  const phase = exposureTitlePhase(progress);
  return {
    x: position.source.x + (position.target.x - position.source.x) * phase.horizontal,
    y: position.source.y + (position.target.y - position.source.y) * phase.vertical,
  };
}

export function canMorphExposureWords(
  sources: readonly ExposureWordBounds[],
  targets: readonly ExposureWordBounds[],
  width: number,
) {
  if (sources.length !== 5 || targets.length !== 5 || width <= 0) return false;
  if ([...sources, ...targets].some((word) => word.width <= 0 || word.width > width)) return false;
  // Enlarged text may wrap the final phrase. Keep the full static sentence when
  // its target no longer has distinct horizontal tracks for the surviving words.
  if (targets.slice(2).some((word) => Math.abs(word.top - targets[1].top) > 1)) return false;
  if (sources.slice(1).some((word) => Math.abs(word.top - sources[0].top) <= 1)) return false;
  return targets.at(-1)!.left + targets.at(-1)!.width - targets[1].left <= width;
}
