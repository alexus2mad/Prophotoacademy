import { describe, expect, it } from 'vitest';
import {
  smoothExposureProgress,
  studioExposureAtProgress,
} from '../../src/lib/studio-home/exposure';

describe('shared exposure scroll response', () => {
  it('smooths a wheel step and keeps every presentation value on the same timeline', () => {
    const progress = smoothExposureProgress(0.5, 0.8, 16);
    expect(progress).toBeGreaterThan(0.5);
    expect(progress).toBeLessThan(0.8);
    const state = studioExposureAtProgress(progress);
    expect(state.progress).toBe(progress);
    expect(state.activeBars).toBe(Math.round(progress * 33));
    expect(state.value).toBe(`−${(3 * (1 - progress)).toFixed(1)} EV`);
  });

  it('has the same response at different refresh rates', () => {
    const sample = (frames: number) => {
      let progress = 0.25;
      for (let frame = 0; frame < frames; frame++)
        progress = smoothExposureProgress(progress, 0.75, 240 / frames);
      return progress;
    };
    expect(sample(14)).toBeCloseTo(sample(29), 12);
    expect(sample(29)).toBeCloseTo(smoothExposureProgress(0.25, 0.75, 240), 12);
  });

  it('responds symmetrically in reverse and never overshoots a changed target', () => {
    const forward = smoothExposureProgress(0.2, 0.8, 80);
    const reverse = smoothExposureProgress(0.8, 0.2, 80);
    expect(forward + reverse).toBeCloseTo(1, 12);
    const changed = smoothExposureProgress(forward, 0.1, 16);
    expect(changed).toBeLessThan(forward);
    expect(changed).toBeGreaterThan(0.1);
    expect(smoothExposureProgress(0.25, 0.75, -1)).toBe(0.25);
  });

  it('settles on exact endpoints and finite intermediate targets', () => {
    for (const target of [0, 0.37, 1]) {
      let progress = 0.65;
      let frames = 0;
      while (progress !== target && frames++ < 100)
        progress = smoothExposureProgress(progress, target, 16);
      expect(progress).toBe(target);
      expect(frames).toBeLessThan(100);
      expect(smoothExposureProgress(progress, target, 16)).toBe(target);
    }
    expect(studioExposureAtProgress(-1).progress).toBe(0);
    expect(studioExposureAtProgress(2).progress).toBe(1);
  });
});
