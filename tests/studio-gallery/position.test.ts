import { describe, expect, it } from 'vitest';
import {
  galleryImageTarget,
  nearestGalleryImage,
} from '../../src/components/organisms/StudioSpacesGallery/position';

describe('gallery navigation with different image widths', () => {
  const offsets = [0, 304, 486, 850];

  it('finds the nearest image after a touch scroll', () => {
    expect(nearestGalleryImage(offsets, 470)).toBe(2);
    expect(nearestGalleryImage(offsets, 680)).toBe(3);
  });

  it('uses actual image boundaries for arrows in both directions', () => {
    expect(galleryImageTarget(offsets, 304, 1)).toBe(486);
    expect(galleryImageTarget(offsets, 486, -1)).toBe(304);
  });

  it('navigates back from a final position clamped by the viewport', () => {
    expect(galleryImageTarget(offsets, 760, -1)).toBe(486);
  });

  it('keeps boundary navigation within the gallery', () => {
    expect(galleryImageTarget(offsets, 0, -1)).toBe(0);
    expect(galleryImageTarget(offsets, 850, 1)).toBe(850);
    expect(galleryImageTarget([], 0, 1)).toBe(0);
  });
});
