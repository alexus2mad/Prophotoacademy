import type { AcademyContent, Program } from '@/lib/content/types';
export type CatalogTemplateProps = {
  content: AcademyContent;
  programs: Program[];
  query?: string;
};
