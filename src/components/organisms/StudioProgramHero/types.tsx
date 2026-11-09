import type { Offering, Program } from '@/lib/content/types';
import type { ProgramPresentation } from '@/lib/programs/types';
import type { StudioProgramArtwork } from '@/lib/studio-program/types';

export type StudioProgramHeroProps = {
  program: Program;
  offering?: Offering;
  presentation: ProgramPresentation;
  hero: StudioProgramArtwork;
};
