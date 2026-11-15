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
  maxScroll: number,
) {
  const stops = [...offsets.filter((offset) => offset < maxScroll - 1), maxScroll];
  const current = nearestGalleryImage(stops, scrollLeft);
  return stops[Math.max(0, Math.min(stops.length - 1, current + direction))];
}
