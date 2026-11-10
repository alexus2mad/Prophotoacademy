import type { CardBounds, CardClip, CardViewport } from './types';

/** A sliver at the edge of a horizontal rail must not become its active photograph. */
export function visibleCardBounds(
  bounds: CardBounds,
  clips: readonly CardClip[],
  viewport: CardViewport,
) {
  const visible = {
    left: Math.max(0, bounds.left),
    right: Math.min(viewport.width, bounds.right),
    top: Math.max(0, bounds.top),
    bottom: Math.min(viewport.height, bounds.bottom),
  };
  for (const clip of clips) {
    if (clip.horizontal) {
      visible.left = Math.max(visible.left, clip.bounds.left);
      visible.right = Math.min(visible.right, clip.bounds.right);
    }
    if (clip.vertical) {
      visible.top = Math.max(visible.top, clip.bounds.top);
      visible.bottom = Math.min(visible.bottom, clip.bounds.bottom);
    }
  }
  const area = (bounds.right - bounds.left) * (bounds.bottom - bounds.top);
  const width = visible.right - visible.left;
  const height = visible.bottom - visible.top;
  return width > 0 && height > 0 && area > 0 && width * height >= area * 0.35 ? visible : null;
}

/** Move the focal point across a short rail so its end cards remain reachable. */
export function horizontalScrollFocus(
  left: number,
  right: number,
  cardWidth: number,
  scrollLeft: number,
  maximumScroll: number,
) {
  const width = Math.max(0, right - left);
  const inset = Math.min(cardWidth / 2, width / 2);
  const progress = maximumScroll > 0 ? Math.max(0, Math.min(1, scrollLeft / maximumScroll)) : 0.5;
  return left + inset + (width - 2 * inset) * progress;
}

/** Select one card near the focal point; retain it through small scroll-boundary fluctuations. */
export function selectScrollCard(
  bounds: readonly (CardBounds | null)[],
  viewport: CardViewport,
  previous: number,
  horizontalFocus: readonly number[] = [],
) {
  const distances = bounds.map((rect, index) =>
    rect
      ? Math.hypot(
          (rect.left + rect.right) / 2 - (horizontalFocus[index] ?? viewport.width / 2),
          (rect.top + rect.bottom - viewport.height) / 2,
        )
      : Infinity,
  );
  let nearest = -1;
  for (let index = 0; index < distances.length; index++) {
    if (
      Number.isFinite(distances[index]) &&
      (nearest === -1 || distances[index] < distances[nearest])
    )
      nearest = index;
  }
  if (nearest === -1) return -1;
  return previous >= 0 &&
    Number.isFinite(distances[previous]) &&
    distances[previous] <= distances[nearest] + 12
    ? previous
    : nearest;
}
