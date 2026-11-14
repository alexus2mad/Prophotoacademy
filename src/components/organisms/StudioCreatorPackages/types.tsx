import type { Offering, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';

export type StudioCreatorPackagesProps = {
  program: Program;
  offering: Offering;
  enrollment?: EnrollmentOptions;
};
