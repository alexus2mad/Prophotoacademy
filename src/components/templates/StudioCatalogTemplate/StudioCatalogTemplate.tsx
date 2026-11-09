import { Suspense } from 'react';
import { StudioAcademyCatalogResults } from '@/components/organisms/StudioAcademyCatalogResults/StudioAcademyCatalogResults';
import { StudioAcademyCatalog } from '@/components/organisms/StudioAcademyCatalog/StudioAcademyCatalog';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import { catalogCategory } from '@/lib/catalog/selectors';
import type { StudioCatalogTemplateProps } from './types';
import styles from './StudioCatalogTemplate.module.css';

export function StudioCatalogTemplate({
  content,
  programs,
  query = '',
}: StudioCatalogTemplateProps) {
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
      <section className={`${styles.hero} studio-light studio-wrap`}>
        <p className="studio-label">ProPhoto Academy</p>
        <h1 className="studio-title">Програми навчання</h1>
        <p className="studio-lead">Курси, класи та індивідуальні формати навчання.</p>
      </section>
      <section className="studio-band studio-wrap studio-dark" aria-label="Каталог програм">
        <Suspense
          fallback={
            <StudioAcademyCatalogResults
              content={catalogContent}
              programs={programs}
              category={catalogCategory(new URLSearchParams(query).get('category'))}
              query={query}
              asOf={asOf}
            />
          }
        >
          <StudioAcademyCatalog content={catalogContent} programs={programs} asOf={asOf} />
        </Suspense>
      </section>
      <StudioInquirySection title="Допоможемо" hand="обрати" tone="red" />
    </>
  );
}
