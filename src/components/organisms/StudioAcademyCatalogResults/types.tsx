import type { AcademyContent, Program } from '@/lib/content/types';
import type { CatalogCategory } from '@/lib/catalog/types';

export type StudioAcademyCatalogResultsProps = {
  programs: Program[];
  content: Pick<AcademyContent, 'images' | 'offerings'>;
  category: CatalogCategory;
  asOf: string;
  query?: string;
};
