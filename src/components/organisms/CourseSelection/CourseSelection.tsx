import { CoursePreview } from '@/components/molecules/CoursePreview/CoursePreview';
import { findImage, findOffering } from '@/lib/content/selectors';
import Link from 'next/link';
import type { CourseSelectionProps } from './types';
export function CourseSelection({ primary, courses, content }: CourseSelectionProps) {
  return (
    <section className="course-selection container" id="courses" aria-labelledby="selection-title">
      <div className="selection-heading">
        <h2 id="selection-title">{primary ? 'Інші програми' : 'Наші курси'}</h2>
        <Link href="/courses" className="text-link">
          Усі програми
        </Link>
      </div>
      <div
        className={`preview-grid ${primary && courses.length === 2 ? 'preview-grid--secondary' : ''}`}
      >
        {courses.map((p) => (
          <CoursePreview
            key={p.id}
            program={p}
            offering={findOffering(content, p.id)}
            image={findImage(content, p.imageId)}
          />
        ))}
      </div>
      <div className="other-programs">
        <Link href="/courses?type=class">Класи та події</Link>
        <Link href="/individual-training">Індивідуально</Link>
        <Link href="/corporate-training">Для команд</Link>
      </div>
    </section>
  );
}
