import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import type { AcademyContent } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';
export type StudioIntensiveTemplateProps = BrandContentProps & {
  content: AcademyContent;
  enrollment?: EnrollmentOptions;
};
