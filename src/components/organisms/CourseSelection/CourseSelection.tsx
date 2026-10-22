import { CoursePreview } from '@/components/molecules/CoursePreview/CoursePreview';
import { findImage, findOffering } from '@/lib/content/selectors';
import Link from 'next/link';
import type { CourseSelectionProps } from './types';
export function CourseSelection({ primary, courses, content }: CourseSelectionProps) {
  const selection = primary ? [primary, ...courses] : courses;
  return (
    <section className="course-selection container" id="courses" aria-labelledby="selection-title">
      <div className="selection-heading">
        <div>
          <p className="eyebrow">Твій наступний крок</p>
          <h2 id="selection-title">
            Від «хочу так»
            <br />
            до «це знято мною»
          </h2>
        </div>
        <Link href="/courses" className="text-link">
          Усі програми
        </Link>
      </div>
      <div className="preview-grid">
        {selection.map((p) => (
          <CoursePreview
            key={p.id}
            program={p}
            offering={findOffering(content, p.id)}
            image={findImage(content, p.imageId)}
          />
        ))}
      </div>
      <div className="other-programs">
        <span>Шукаєш інший формат?</span>
        <Link href="/courses?type=class">Класи та події</Link>
        <Link href="/individual-training">Індивідуально</Link>
        <Link href="/corporate-training">Для команд</Link>
      </div>
    </section>
  );
}
