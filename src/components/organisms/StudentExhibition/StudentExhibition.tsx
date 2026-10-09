import { Gallery } from '@/components/organisms/Gallery/Gallery';
import Link from 'next/link';
import type { StudentExhibitionProps } from './types';
export function StudentExhibition({ content }: StudentExhibitionProps) {
  return (
    <section className="editorial-section student-exhibition container" data-editorial-reveal>
      <div className="section-heading">
        <div>
          <h2>Роботи студентів</h2>
        </div>
        <div className="section-side">
          <Link href="/student-work" className="text-link">
            Усі роботи студентів
          </Link>
        </div>
      </div>
      <Gallery works={content.works} images={content.images} />
    </section>
  );
}
