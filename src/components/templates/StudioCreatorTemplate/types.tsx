import type { AcademyContent, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';
export type StudioCreatorTemplateProps = {
  program: Program;
  content: AcademyContent;
  enrollment?: EnrollmentOptions;
};
