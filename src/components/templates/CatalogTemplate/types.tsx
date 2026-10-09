import type { CatalogQuery } from '@/lib/catalog/types';
import type { AcademyContent, Program } from '@/lib/content/types';
export type CatalogTemplateProps = {
  content: AcademyContent;
  programs: Program[];
  filters: CatalogQuery;
  review?: boolean;
};
