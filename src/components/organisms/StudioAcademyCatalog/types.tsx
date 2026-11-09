import type { StudioAcademyCatalogResultsProps } from '@/components/organisms/StudioAcademyCatalogResults/types';
export type StudioAcademyCatalogProps = Pick<
  StudioAcademyCatalogResultsProps,
  'programs' | 'content' | 'asOf'
>;
