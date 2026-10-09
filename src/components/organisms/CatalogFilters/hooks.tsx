'use client';
import { useState } from 'react';
import type { CatalogFilterOptions } from './types';

export function useCatalogFilters({ format = '', level = '' }: CatalogFilterOptions) {
  const [expanded, setExpanded] = useState(Boolean(format || level));
  const submit = (event: React.ChangeEvent<HTMLSelectElement>) =>
    event.currentTarget.form?.requestSubmit();
  return { expanded, setExpanded, submit };
}
