import Link from 'next/link';
import { StudioAcademyProgramRow } from '@/components/molecules/StudioAcademyProgramRow/StudioAcademyProgramRow';
import { catalogHref, catalogPrograms } from '@/lib/catalog/selectors';
import { findOffering } from '@/lib/content/selectors';
import { studioProgramImage } from '@/lib/studio-pages/selectors';
import type { StudioAcademyCatalogResultsProps } from './types';
import styles from './StudioAcademyCatalogResults.module.css';

export function StudioAcademyCatalogResults({
  programs,
  content,
  category,
  query,
  asOf,
}: StudioAcademyCatalogResultsProps) {
  const visiblePrograms = catalogPrograms(programs, category);
  return (
    <div data-catalog-category={category}>
      <nav className={styles.filters} aria-label="Категорії програм">
        <Link
          className={category === 'all' ? 'studio-button' : 'studio-button-outline'}
          href={catalogHref('all', query)}
          aria-current={category === 'all' ? 'page' : undefined}
          scroll={false}
        >
          Усі програми
        </Link>
        <Link
          className={category === 'course' ? 'studio-button' : 'studio-button-outline'}
          href={catalogHref('course', query)}
          aria-current={category === 'course' ? 'page' : undefined}
          scroll={false}
        >
          Курси
        </Link>
      </nav>
      {visiblePrograms.length ? (
        <div>
          {visiblePrograms.map((program) => (
            <StudioAcademyProgramRow
              key={program.id}
              program={program}
              offering={findOffering(content, program.id)}
              asset={studioProgramImage(program, content.images)}
              asOf={asOf}
              heading="h2"
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>{category === 'course' ? 'Наразі немає курсів' : 'Наразі немає програм'}</h2>
          <p>Зверніться до нас, щоб дізнатися про навчання.</p>
        </div>
      )}
    </div>
  );
}
