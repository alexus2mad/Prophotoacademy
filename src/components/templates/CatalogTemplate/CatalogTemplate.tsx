import { CourseCard } from '@/components/molecules/CourseCard/CourseCard';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { findImage, findOffering } from '@/lib/content/selectors';
import type { CatalogTemplateProps } from './types';
export function CatalogTemplate({ content, programs }: CatalogTemplateProps) {
  return (
    <>
      <div className="container editorial-catalog">
        <div className="page-heading catalog-heading">
          <h1>Програми навчання</h1>
          <p className="lead muted">Курси, класи та індивідуальні формати навчання.</p>
        </div>
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
            <h2>Наразі немає програм</h2>
            <p className="muted">Зверніться до нас, щоб дізнатися про навчання.</p>
          </div>
        )}
      </div>
      <Consultation compact />
    </>
  );
}
