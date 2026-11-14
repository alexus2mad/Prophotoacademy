import { studioAssets } from '@/lib/studio-design/assets';

/** Local assets from Figma 949:443, with previously approved full-resolution originals. */
export const creatorAssets = {
  hero: { src: '/images/studio/creator/hero-smoke-149573fc6076.webp', width: 1920, height: 936 },
  monochrome: {
    src: '/images/studio/creator/student-monochrome-portrait-1769ac5724e7.webp',
    width: 750,
    height: 938,
  },
  curly: {
    src: '/images/studio/creator/student-curly-preview-419bcb36ce56.webp',
    width: 375,
    height: 938,
  },
  studio: studioAssets.artifact.studio_band,
  connectors: [
    'connector-practice-667cb0478a98.svg',
    'connector-all-practice-ed011219883b.svg',
    'connector-lecturers-ae560d9eec9d.svg',
    'connector-recording-0eaec2930181.svg',
    'connector-cohort-0480fd328c3d.svg',
    'connector-commerce-39d9b369f696.svg',
  ].map((name) => `/images/studio/creator/${name}`),
};
