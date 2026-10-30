import Link from 'next/link';
import { CourseCard } from '@/components/molecules/CourseCard/CourseCard';
import { catalogHref, catalogPrograms } from '@/lib/catalog/selectors';
import { findImage, findOffering } from '@/lib/content/selectors';
import type { CatalogResultsProps } from './types';
import styles from './CatalogResults.module.css';

export function CatalogResults({
  programs,
  content,
  category,
  query,
  motionReady = false,
}: CatalogResultsProps) {
  const visiblePrograms = catalogPrograms(programs, category);
  return (
    <div data-catalog-category={category} data-card-motion-pending={!motionReady || undefined}>
      <nav className={styles.categories} aria-label="Категорії програм">
        <Link
          className={'button' + (category === 'all' ? '' : ' button-secondary')}
          href={catalogHref('all', query)}
          aria-current={category === 'all' ? 'page' : undefined}
          scroll={false}
        >
          Усі програми
        </Link>
        <Link
          className={'button' + (category === 'course' ? '' : ' button-secondary')}
          href={catalogHref('course', query)}
          aria-current={category === 'course' ? 'page' : undefined}
          scroll={false}
        >
          Курси
        </Link>
      </nav>
      {visiblePrograms.length ? (
        <div className="course-grid">
          {visiblePrograms.map((program) => (
            <CourseCard
              key={program.id}
              program={program}
              offering={findOffering(content, program.id)}
              image={findImage(content, program.imageId)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{category === 'course' ? 'Наразі немає курсів' : 'Наразі немає програм'}</h2>
          <p className="muted">Зверніться до нас, щоб дізнатися про навчання.</p>
        </div>
      )}
    </div>
  );
}
