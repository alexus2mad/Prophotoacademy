import images from './images.json';

/** Prepared by scripts/prepare-food-course-images.mjs from scripts/food-course-images.json. */
const hero = images.find((image) => image.role === 'hero');
if (!hero || typeof hero.position === 'string') throw new Error('Food hero asset is missing');

export const foodAssets = {
  hero: {
    asset: { src: hero.src, width: hero.width, height: hero.height },
    alt: hero.alt,
    position: hero.position.desktop,
    mobilePosition: hero.position.mobile,
  },
};
