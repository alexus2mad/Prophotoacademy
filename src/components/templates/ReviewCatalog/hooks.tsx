'use client';
import type { CatalogQuery } from '@/lib/catalog/types';
import { useEffect, useState } from 'react';
export function useReviewCatalog() {
  const [filters, setFilters] = useState<CatalogQuery>({});
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setFilters({
      type: query.get('type') || '',
      format: query.get('format') || '',
      level: query.get('level') || '',
    });
  }, []);
  return { filters };
}
