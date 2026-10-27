import type { ImageAsset, Offering, Program } from '@/lib/content/types';
import type { ProgramPresentation } from '@/lib/programs/types';
export type ProgramHeroProps = {
  program: Program;
  offering?: Offering;
  image: ImageAsset;
  presentation: ProgramPresentation;
};
