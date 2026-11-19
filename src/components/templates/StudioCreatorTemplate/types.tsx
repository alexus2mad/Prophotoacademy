import type { AcademyContent, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';
import type { StudioCourseEditorial } from '@/lib/studio-creator/types';
export type StudioCreatorTemplateProps = {
  program: Program;
  content: AcademyContent;
  enrollment?: EnrollmentOptions;
  editorial: StudioCourseEditorial;
};
