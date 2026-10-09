import { CourseCard } from '@/components/molecules/CourseCard/CourseCard';
import { CatalogFilters } from '@/components/organisms/CatalogFilters/CatalogFilters';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { findImage, findOffering } from '@/lib/content/selectors';
import Link from 'next/link';
import type { CatalogTemplateProps } from './types';
export function CatalogTemplate({
  content,
  programs,
  filters,
  review = false,
}: CatalogTemplateProps) {
  return (
    <>
      <div className="container">
        <div className="page-heading catalog-heading">
          <h1>Усі програми</h1>
          <p className="lead muted">Курси, класи та індивідуальні формати навчання.</p>
        </div>
        <CatalogFilters key={JSON.stringify(filters)} {...filters} count={programs.length} />
        {programs.length ? (
          <div className="course-grid">
            {programs.map((p) => (
              <CourseCard
                key={p.id}
                program={p}
                offering={findOffering(content, p.id)}
                image={findImage(content, p.imageId)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Поки немає такого поєднання</h2>
            <p className="muted">
              {review
                ? 'Спробуйте інший формат.'
                : 'Спробуйте інший формат або перегляньте всі програми.'}
            </p>
            <Link href="/courses" className="button">
              Скинути фільтри
            </Link>
          </div>
        )}
      </div>
      <Consultation />
    </>
  );
}
