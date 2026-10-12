import type { Offering, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';
export type ProgramPackagesProps = {
  offering: Offering;
  program: Program;
  enrollment?: EnrollmentOptions;
};
