import { describe, expect, it } from 'vitest';
import {
  studioCompactExposureAtProgress,
  studioCompactExposureState,
  studioExposureState,
} from '../../src/lib/studio-home/exposure';
import type { StudioExposureGeometry } from '../../src/lib/studio-home/types';

const original: StudioExposureGeometry = {
  top: 0,
  height: 1350,
  stageHeight: 900,
  reducedMotion: false,
};

describe('desktop cinematic exposure choreography', () => {
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

  it('uses the same photo, meter and title progress across desktop stage heights', () => {
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

describe('compact artifact exposure', () => {
  const geometry = { top: 440, height: 280, viewportHeight: 800, reducedMotion: false };

  it('starts at 55% viewport height and finishes using the section plus 20% viewport span', () => {
    expect(studioCompactExposureState(geometry).progress).toBeCloseTo(0);
    expect(studioCompactExposureState({ ...geometry, top: 220 }).progress).toBeCloseTo(0.5);
    expect(studioCompactExposureState({ ...geometry, top: 0 }).progress).toBe(1);
    expect(studioCompactExposureState({ ...geometry, top: -100 }).progress).toBe(1);
    expect(studioCompactExposureState({ ...geometry, top: 900 }).progress).toBe(0);
  });

  it('fills white first and then red from left to right while EV rises from 0 to +3', () => {
    expect(studioCompactExposureAtProgress(0)).toMatchObject({
      activeBars: 0,
      redBars: 0,
      redStart: 0,
      value: '0.0 EV',
    });
    expect(studioCompactExposureAtProgress(0.225)).toMatchObject({
      activeBars: 17,
      redBars: 0,
      value: '+0.8 EV',
    });
    expect(studioCompactExposureAtProgress(0.45)).toMatchObject({
      activeBars: 33,
      redBars: 0,
      value: '+1.5 EV',
    });
    expect(studioCompactExposureAtProgress(0.625)).toMatchObject({
      activeBars: 33,
      redBars: 17,
      redStart: 0,
      value: '+2.3 EV',
    });
    expect(studioCompactExposureAtProgress(0.8)).toMatchObject({
      activeBars: 33,
      redBars: 33,
      value: '+3.0 EV',
    });
  });

  it('reverses precisely without retaining a previous meter state', () => {
    [0, 220, 440].forEach((top, index) => {
      expect(studioCompactExposureState({ ...geometry, top }).progress).toBeCloseTo(
        [1, 0.5, 0][index],
      );
    });
  });

  it('uses two static reduced-motion states at the artifact bottom-edge threshold', () => {
    expect(
      studioCompactExposureState({ ...geometry, top: 200, reducedMotion: true }),
    ).toMatchObject({ progress: 0, activeBars: 33, redBars: 0, value: '+1.5 EV' });
    expect(
      studioCompactExposureState({ ...geometry, top: 199, reducedMotion: true }),
    ).toMatchObject({ progress: 1, activeBars: 33, redBars: 33, value: '+3.0 EV' });
  });

  it('keeps initial unmeasured geometry finite', () => {
    const exposure = studioCompactExposureState({
      ...geometry,
      top: 0,
      height: 0,
      viewportHeight: 0,
    });
    expect(exposure.progress).toBe(0);
    expect(exposure.value).toBe('0.0 EV');
  });
});
