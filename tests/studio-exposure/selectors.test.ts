import { describe, expect, it } from 'vitest';
import { studioExposureState } from '../../src/lib/studio-home/exposure';
import type { StudioExposureGeometry } from '../../src/lib/studio-home/types';

const original: StudioExposureGeometry = {
  top: 0,
  height: 1350,
  stageHeight: 900,
  reducedMotion: false,
};

describe('shared cinematic exposure choreography', () => {
  it('preserves fractional scroll motion instead of quantizing the short title phases', () => {
    const geometry = { ...original, stageHeight: 844, height: 2532 };
    const first = studioExposureState({ ...geometry, top: -1200 }).progress;
    const next = studioExposureState({ ...geometry, top: -1200.1 }).progress;
    expect(next - first).toBeGreaterThan(0);
    expect(next - first).toBeLessThan(0.0001);
  });

  it('retains the four-times-slower runway and holds the original title through the midpoint', () => {
    const slower = { ...original, height: original.stageHeight * 3 };
    expect(studioExposureState({ ...original, top: -360 }).progress).toBe(1);
    expect(studioExposureState({ ...slower, top: -360 }).progress).toBe(0.25);
    expect(studioExposureState({ ...slower, top: -720 })).toMatchObject({
      progress: 0.5,
      activeBars: 17,
      value: '−1.5 EV',
    });
    expect(studioExposureState({ ...slower, top: -1440 }).progress).toBe(1);
  });

  it('uses the same photo, meter and title progress at phone and desktop stage sizes', () => {
    for (const stageHeight of [640, 844, 900]) {
      const geometry = { ...original, height: stageHeight * 3, stageHeight };
      expect(studioExposureState({ ...geometry, top: 200 })).toMatchObject({
        progress: 0,
        activeBars: 0,
        redBars: 0,
        value: '−3.0 EV',
      });
      expect(studioExposureState({ ...geometry, top: -stageHeight * 0.8 })).toMatchObject({
        progress: 0.5,
        activeBars: 17,
        redBars: 0,
        value: '−1.5 EV',
      });
      expect(studioExposureState({ ...geometry, top: -stageHeight * 1.6 })).toMatchObject({
        progress: 1,
        activeBars: 33,
        redStart: 27,
        redBars: 6,
        value: '0.0 EV',
      });
    }
  });

  it('starts when the section reaches its safe-area sticky offset and reverses exactly', () => {
    const geometry = { ...original, height: 2700, stickyOffset: 24 };
    expect(studioExposureState({ ...geometry, top: 24 }).progress).toBe(0);
    expect(studioExposureState({ ...geometry, top: 24 - 720 }).progress).toBe(0.5);
    expect(
      [24 - 1440, 24 - 720, 24].map((top) => studioExposureState({ ...geometry, top }).progress),
    ).toEqual([1, 0.5, 0]);
  });

  it('renders a fully exposed static scene with reduced motion regardless of scroll position', () => {
    for (const top of [900, 0, -720, -1800]) {
      expect(studioExposureState({ ...original, top, reducedMotion: true })).toMatchObject({
        progress: 1,
        activeBars: 33,
        redBars: 6,
        value: '0.0 EV',
      });
    }
  });

  it('keeps progress finite before layout is measurable', () => {
    const result = studioExposureState({ ...original, height: 0, stageHeight: 0 });
    expect(Number.isFinite(result.progress)).toBe(true);
    expect(result.value).not.toContain('NaN');
  });
});
