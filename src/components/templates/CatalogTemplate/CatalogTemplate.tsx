import { Suspense } from 'react';
import { CatalogResults } from '@/components/organisms/CatalogResults/CatalogResults';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { ProgramCatalog } from '@/components/organisms/ProgramCatalog/ProgramCatalog';
import { catalogCategory } from '@/lib/catalog/selectors';
import type { CatalogTemplateProps } from './types';
export function CatalogTemplate({ content, programs, query = '' }: CatalogTemplateProps) {
  const asOf = new Date().toISOString();
  const catalogContent = {
    images: content.images.filter((image) =>
      programs.some((program) => program.imageId === image.id),
    ),
    offerings: content.offerings.filter((offering) =>
      programs.some((program) => program.id === offering.programId),
    ),
  };
  return (
    <>
      <div className="container editorial-catalog">
        <div className="page-heading catalog-heading">
          <h1>Програми навчання</h1>
          <p className="lead muted">Курси, класи та індивідуальні формати навчання.</p>
        </div>
        <Suspense
          fallback={
            <CatalogResults
              content={catalogContent}
              programs={programs}
              category={catalogCategory(new URLSearchParams(query).get('category'))}
              query={query}
              asOf={asOf}
            />
          }
        >
          <ProgramCatalog content={catalogContent} programs={programs} asOf={asOf} />
        </Suspense>
      </div>
      <Consultation compact />
    </>
  );
}
