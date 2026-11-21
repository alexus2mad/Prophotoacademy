import type { AcademyContent, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';

import type { StudioProgramArtwork } from '@/lib/studio-program/types';
import type { SitePage } from '@/lib/site-editor/types';
export type StudioProgramTemplateProps = {
  page?: SitePage;
  artwork?: StudioProgramArtwork;
  program: Program;
  content: AcademyContent;
  enrollment?: EnrollmentOptions;
};
