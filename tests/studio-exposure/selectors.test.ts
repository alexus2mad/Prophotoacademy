import { describe, expect, it } from 'vitest';
import { studioExposureState } from '../../src/lib/studio-home/exposure';
import type { StudioExposureGeometry } from '../../src/lib/studio-home/types';

const desktop: StudioExposureGeometry = {
  top: 0,
  height: 1350,
  viewportHeight: 900,
  mobile: false,
  reducedMotion: false,
};
const mobile = { ...desktop, height: 286, viewportHeight: 844, mobile: true };
const mobileAt = (transition: number) => ({
  ...mobile,
  top: mobile.viewportHeight * 0.55 - transition * (mobile.height + mobile.viewportHeight * 0.2),
});

describe('artifact exposure choreography', () => {
  it('stays dark on entry and fills over 80% of the desktop sticky runway', () => {
    expect(studioExposureState({ ...desktop, top: 600 })).toMatchObject({
      progress: 0,
      activeBars: 0,
      redBars: 0,
      value: '−3.0 EV',
    });
    expect(studioExposureState({ ...desktop, top: -180 })).toMatchObject({
      progress: 0.5,
      activeBars: 17,
      redBars: 0,
      value: '−1.5 EV',
    });
    expect(studioExposureState({ ...desktop, top: -360 })).toMatchObject({
      progress: 1,
      activeBars: 33,
      redStart: 27,
      redBars: 6,
      value: '0.0 EV',
    });
    expect(studioExposureState({ ...desktop, top: -900 }).progress).toBe(1);
  });

  it('reverses with scrolling rather than retaining the highest exposure', () => {
    const values = [-360, -180, 0].map((top) => studioExposureState({ ...desktop, top }).progress);
    expect(values).toEqual([1, 0.5, 0]);
  });

  it('reproduces the observed mobile white fill and then red fill with one EV reading', () => {
    expect(studioExposureState(mobileAt(0))).toMatchObject({
      transition: 0,
      activeBars: 0,
      redBars: 0,
      value: '0.0 EV',
    });
    expect(studioExposureState(mobileAt(0.331))).toMatchObject({
      transition: 0.331,
      activeBars: 24,
      redBars: 0,
      value: '+1.1 EV',
    });
    expect(studioExposureState(mobileAt(0.625))).toMatchObject({
      transition: 0.625,
      activeBars: 33,
      redBars: 17,
      redStart: 0,
      value: '+2.3 EV',
    });
    expect(studioExposureState(mobileAt(1))).toMatchObject({
      transition: 1,
      activeBars: 33,
      redBars: 33,
      value: '+3.0 EV',
    });
    expect(studioExposureState(mobileAt(0)).redBars).toBe(0);
  });

  it('uses stable desktop exposure and a discrete mobile transition for reduced motion', () => {
    expect(studioExposureState({ ...desktop, top: 900, reducedMotion: true })).toMatchObject({
      progress: 1,
      value: '0.0 EV',
    });
    expect(studioExposureState({ ...mobile, top: 500, reducedMotion: true })).toMatchObject({
      transition: 0,
      activeBars: 33,
      redBars: 0,
      value: '+1.5 EV',
    });
    expect(studioExposureState({ ...mobile, top: 100, reducedMotion: true })).toMatchObject({
      transition: 1,
      redBars: 33,
      value: '+3.0 EV',
    });
  });

  it('keeps values finite during zero-size layout and breakpoint changes', () => {
    for (const isMobile of [false, true]) {
      const result = studioExposureState({
        ...desktop,
        height: 0,
        viewportHeight: 0,
        mobile: isMobile,
      });
      expect(Number.isFinite(result.progress)).toBe(true);
      expect(Number.isFinite(result.transition)).toBe(true);
      expect(result.value).not.toContain('NaN');
    }
  });
});
