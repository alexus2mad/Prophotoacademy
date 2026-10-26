import images from './home-images.json';
import type { ImageAsset } from '@/lib/content/types';
export function academyHomePhoto(id: keyof typeof images): ImageAsset {
  return images[id];
}
