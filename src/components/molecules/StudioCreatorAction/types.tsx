import type { Offering, Program } from '@/lib/content/types';
import type { ProgramPresentation } from '@/lib/programs/types';

export type StudioCreatorActionProps = {
  program: Program;
  offering?: Offering;
  presentation: ProgramPresentation;
  label?: string;
};
