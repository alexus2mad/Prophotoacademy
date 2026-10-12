import type { ImageSize, ImageTransform } from './types';

export function constrainImage(transform: ImageTransform, viewport: ImageSize, image: ImageSize) {
  const scale = Math.min(4, Math.max(1, transform.scale));
  const fit = Math.min(viewport.width / image.width, viewport.height / image.height);
  const xLimit = Math.max(0, (image.width * fit * scale - viewport.width) / 2);
  const yLimit = Math.max(0, (image.height * fit * scale - viewport.height) / 2);
  return {
    scale,
    x: xLimit ? Math.min(xLimit, Math.max(-xLimit, transform.x)) : 0,
    y: yLimit ? Math.min(yLimit, Math.max(-yLimit, transform.y)) : 0,
  };
}

export function imageSwipe(x: number, y: number) {
  return Math.abs(x) >= 50 && Math.abs(x) > Math.abs(y) * 1.5 ? (x < 0 ? 1 : -1) : 0;
}
