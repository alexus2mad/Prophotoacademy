import type { ImageAsset, Program } from '@/lib/content/types';
import { studioAssets } from '@/lib/studio-design/assets';

const academyCourseOrder = new Map(
  ['program-commercial', 'program-visual', 'program-instagram', 'program-food'].map((id, index) => [
    id,
    index,
  ]),
);

export function studioAcademyCourses(programs: Program[]) {
  return programs
    .filter((program) => program.category === 'course')
    .sort(
      (left, right) =>
        (academyCourseOrder.get(left.id) ?? academyCourseOrder.size) -
        (academyCourseOrder.get(right.id) ?? academyCourseOrder.size),
    );
}

export function studioProgramImage(program: Program, images: ImageAsset[]) {
  if (program.slug === 'visual-content') return studioAssets.academy.imgImgDirGold;
  if (program.slug === 'course-smm-instagram') return studioAssets.academy.imgImgSnow;
  if (program.slug === 'food-product-photography') return studioAssets.artifact.hero_academy;
  if (program.slug === 'food-photography') return studioAssets.academy.imgImgContent2;
  return images.find((image) => image.id === program.imageId);
}
