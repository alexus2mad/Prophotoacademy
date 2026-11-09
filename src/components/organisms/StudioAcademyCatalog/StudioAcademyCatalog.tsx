'use client';

import { StudioAcademyCatalogResults } from '@/components/organisms/StudioAcademyCatalogResults/StudioAcademyCatalogResults';
import { useProgramCatalog } from '@/components/organisms/ProgramCatalog/hooks';
import type { StudioAcademyCatalogProps } from './types';

export function StudioAcademyCatalog(props: StudioAcademyCatalogProps) {
  const selection = useProgramCatalog(props.asOf);
  return <StudioAcademyCatalogResults {...props} {...selection} />;
}
