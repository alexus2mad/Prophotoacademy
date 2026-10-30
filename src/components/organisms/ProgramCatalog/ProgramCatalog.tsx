'use client';
import { CatalogResults } from '@/components/organisms/CatalogResults/CatalogResults';
import { useProgramCatalog } from './hooks';
import type { ProgramCatalogProps } from './types';

export function ProgramCatalog(props: ProgramCatalogProps) {
  const selection = useProgramCatalog(props.asOf);
  return <CatalogResults {...props} {...selection} />;
}
