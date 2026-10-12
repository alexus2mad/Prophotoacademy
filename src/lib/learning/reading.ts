import type { ReadingObservation } from './types';

export function createReadingTracker(
  report: (sample: ReadingObservation) => void,
  interval = 10,
  initialTime = Date.now(),
) {
  let lastTick = initialTime;
  let observedAt = initialTime;
  let elapsed = 0;
  const coverage = new Set<number>();
  function flush() {
    if (!elapsed) return;
    report({ elapsed, observedAt: new Date(observedAt).toISOString(), coverage: [...coverage] });
    elapsed = 0;
    coverage.clear();
  }
  return {
    flush,
    tick(now: number, visibleCoverage: number[] | null) {
      const delta = (now - lastTick) / 1000;
      lastTick = now;
      // End the old window at its last observation, not when the user later leaves the page.
      if (!visibleCoverage || delta <= 0 || delta > 2) {
        flush();
        return;
      }
      elapsed += delta;
      observedAt = now;
      for (const position of visibleCoverage) coverage.add(position);
      if (elapsed >= interval) flush();
    },
  };
}
