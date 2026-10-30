import { Suspense } from 'react';
import { CatalogResults } from '@/components/organisms/CatalogResults/CatalogResults';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { ProgramCatalog } from '@/components/organisms/ProgramCatalog/ProgramCatalog';
import type { CatalogTemplateProps } from './types';
export function CatalogTemplate({ content, programs }: CatalogTemplateProps) {
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
          fallback={<CatalogResults content={catalogContent} programs={programs} category="all" />}
        >
          <ProgramCatalog content={catalogContent} programs={programs} />
        </Suspense>
      </div>
      <Consultation compact />
    </>
  );
}
