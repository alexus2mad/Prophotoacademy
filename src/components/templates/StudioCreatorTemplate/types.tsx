import type { AcademyContent, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';
import type { StudioCourseEditorial } from '@/lib/studio-creator/types';
import type { SitePage } from '@/lib/site-editor/types';
export type StudioCreatorTemplateProps = {
  page?: SitePage;
  program: Program;
  content: AcademyContent;
  enrollment?: EnrollmentOptions;
  editorial: StudioCourseEditorial;
};
