import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import type { Offering, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';

export type StudioCreatorPackagesProps = BrandContentProps & {
  program: Program;
  offering: Offering;
  enrollment?: EnrollmentOptions;
};
