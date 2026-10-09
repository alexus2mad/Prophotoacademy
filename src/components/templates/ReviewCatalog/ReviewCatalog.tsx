'use client';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate/CatalogTemplate';
import { filterPrograms } from '@/lib/catalog/selectors';
import { useReviewCatalog } from './hooks';
import type { ReviewCatalogProps } from './types';
export function ReviewCatalog({ content }: ReviewCatalogProps) {
  const { filters } = useReviewCatalog();
  return (
    <CatalogTemplate
      content={content}
      programs={filterPrograms(content, filters)}
      filters={filters}
      review
    />
  );
}
