import type { SitePage } from '@/lib/site-editor/types';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import type { AcademyContent } from '@/lib/content/types';
export type StudioAcademyTemplateProps = {
  additionalPages?: SitePage[];
} & BrandContentProps & { content: AcademyContent };
