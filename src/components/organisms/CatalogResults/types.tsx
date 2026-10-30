import type { AcademyContent, Program } from '@/lib/content/types';
import type { CatalogCategory } from '@/lib/catalog/types';

export type CatalogResultsProps = {
  programs: Program[];
  content: Pick<AcademyContent, 'images' | 'offerings'>;
  category: CatalogCategory;
  query?: string;
  motionReady?: boolean;
};
