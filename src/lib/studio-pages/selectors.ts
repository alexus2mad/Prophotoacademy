import type { ImageAsset, Program } from '@/lib/content/types';
import { studioAssets } from '@/lib/studio-design/assets';

export function studioProgramImage(program: Program, images: ImageAsset[]) {
  if (program.slug === 'visual-content') return studioAssets.academy.imgImgDirGold;
  if (program.slug === 'course-smm-instagram') return studioAssets.academy.imgImgSnow;
  if (program.slug === 'food-product-photography') return studioAssets.academy.imgImgContent2;
  return images.find((image) => image.id === program.imageId);
}
