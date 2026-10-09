import type { AcademyContent, ImageAsset, Offering, Program } from '@/lib/content/types';
export type AcademyHeroProps = {
  primary?: Program;
  offering?: Offering;
  heroImage: ImageAsset;
  content: Pick<AcademyContent, 'settings'>;
};
