import { describe, expect, it } from 'vitest';
import {
  galleryImageTarget,
  nearestGalleryImage,
} from '../../src/components/behaviors/GalleryRail/position';

describe('gallery navigation with different image widths', () => {
  const offsets = [0, 304, 486, 850];

  it('finds the nearest image after a touch scroll', () => {
    expect(nearestGalleryImage(offsets, 470)).toBe(2);
    expect(nearestGalleryImage(offsets, 680)).toBe(3);
  });

  it('uses actual image boundaries for arrows in both directions', () => {
    expect(galleryImageTarget(offsets, 304, 1, 850)).toBe(486);
    expect(galleryImageTarget(offsets, 486, -1, 850)).toBe(304);
  });

  it('moves one full column when two rows share the same offsets', () => {
    const grid = [0, 0, 152, 152, 304, 304, 456];
    expect(nearestGalleryImage(grid, 155)).toBe(2);
    expect(galleryImageTarget(grid, 0, 1, 389)).toBe(152);
    expect(galleryImageTarget(grid, 152, 1, 389)).toBe(304);
    expect(galleryImageTarget(grid, 304, 1, 389)).toBe(389);
    expect(galleryImageTarget(grid, 389, -1, 389)).toBe(304);
    expect(galleryImageTarget(grid, 304, -1, 389)).toBe(152);
  });

  it('navigates back from a final position clamped by the viewport', () => {
    expect(galleryImageTarget(offsets, 760, -1, 760)).toBe(486);
  });

  it('moves between the final left-aligned image and the right-aligned viewport', () => {
    const stops = [0, 156, 312, 468, 624];
    expect(galleryImageTarget(stops, 312, 1, 389)).toBe(389);
    expect(galleryImageTarget(stops, 389, -1, 389)).toBe(312);
  });

  it('keeps boundary navigation within the gallery', () => {
    expect(galleryImageTarget(offsets, 0, -1, 850)).toBe(0);
    expect(galleryImageTarget(offsets, 850, 1, 850)).toBe(850);
    expect(galleryImageTarget([], 0, 1, 0)).toBe(0);
  });
});
