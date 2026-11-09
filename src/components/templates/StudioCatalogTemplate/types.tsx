import type { AcademyContent, Program } from '@/lib/content/types';
export type StudioCatalogTemplateProps = {
  content: AcademyContent;
  programs: Program[];
  query?: string;
};
