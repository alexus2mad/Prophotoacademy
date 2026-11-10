export function nearestGalleryImage(offsets: readonly number[], scrollLeft: number) {
  return offsets.reduce(
    (nearest, offset, index) =>
      Math.abs(offset - scrollLeft) < Math.abs(offsets[nearest] - scrollLeft) ? index : nearest,
    0,
  );
}

export function galleryImageTarget(
  offsets: readonly number[],
  scrollLeft: number,
  direction: number,
) {
  const current = nearestGalleryImage(offsets, scrollLeft);
  return offsets[Math.max(0, Math.min(offsets.length - 1, current + direction))] ?? 0;
}
