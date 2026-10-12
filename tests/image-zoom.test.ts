import { describe, expect, it } from 'vitest';
import { constrainImage, imageSwipe } from '../src/components/molecules/ImageZoom/selectors';

describe('lesson photo inspection', () => {
  it('keeps the whole photograph visible at fit size and limits enlargement', () => {
    expect(
      constrainImage(
        { scale: 0.5, x: 40, y: -90 },
        { width: 800, height: 500 },
        { width: 1600, height: 1000 },
      ),
    ).toEqual({ scale: 1, x: 0, y: 0 });
    expect(
      constrainImage(
        { scale: 6, x: 0, y: 0 },
        { width: 800, height: 500 },
        { width: 1600, height: 1000 },
      ).scale,
    ).toBe(4);
  });
  it('constrains a zoomed portrait to its actual fitted edges rather than empty side space', () => {
    expect(
      constrainImage(
        { scale: 2, x: 1000, y: -1000 },
        { width: 800, height: 500 },
        { width: 600, height: 1200 },
      ),
    ).toEqual({ scale: 2, x: 0, y: -250 });
  });
  it('keeps zoomed landscape edges reachable without panning the image off-screen', () => {
    expect(
      constrainImage(
        { scale: 3, x: 1000, y: 1000 },
        { width: 400, height: 600 },
        { width: 1600, height: 900 },
      ),
    ).toEqual({ scale: 3, x: 400, y: 37.5 });
  });
  it('changes photos for deliberate horizontal swipes only', () => {
    expect(imageSwipe(-120, 12)).toBe(1);
    expect(imageSwipe(100, -20)).toBe(-1);
    expect(imageSwipe(30, 0)).toBe(0);
    expect(imageSwipe(70, 100)).toBe(0);
  });
});
