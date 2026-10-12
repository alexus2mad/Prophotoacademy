import type { AcademyContent, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';
export type ProgramTemplateProps = {
  program: Program;
  content: AcademyContent;
  enrollment?: EnrollmentOptions;
};
