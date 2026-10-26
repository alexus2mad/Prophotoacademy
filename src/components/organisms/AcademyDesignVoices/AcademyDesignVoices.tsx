import Link from 'next/link';
import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { academyHomePhoto } from '@/lib/photography/academy-home';
import type { AcademyDesignVoicesProps } from './types';
export function AcademyDesignVoices({ testimonials }: AcademyDesignVoicesProps) {
  return (
    <div className="academy-design-voices">
      <section className="academy-design-quotes" aria-label="Відгуки студентів">
        {testimonials.map((quote) => (
          <figure key={quote.id}>
            <figcaption>{quote.name}</figcaption>
            <blockquote>{quote.quote}</blockquote>
          </figure>
        ))}
      </section>
      <section className="academy-design-gallery" aria-label="Фотографії Олени Попової">
        {(['knit', 'city', 'sea', 'camp'] as const).map((id) => (
          <figure key={id}>
            <PreparedPhoto image={academyHomePhoto(id)} sizes="(max-width: 767px) 50vw, 25vw" />
          </figure>
        ))}
      </section>
      <div className="academy-design-gallery-links">
        <span>Фотографії Олени Попової</span>
        <Link href="/student-work" className="academy-inline-link">
          Роботи наших студентів
        </Link>
        <Link href="/reviews" className="academy-inline-link">
          Усі відгуки
        </Link>
      </div>
    </div>
  );
}
