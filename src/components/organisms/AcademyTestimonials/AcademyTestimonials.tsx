import Link from 'next/link';
import type { AcademyTestimonialsProps } from './types';
export function AcademyTestimonials({ testimonials, courseQuotes }: AcademyTestimonialsProps) {
  return (
    <section className="editorial-section testimonials-section container" data-editorial-reveal>
      <div className="section-heading">
        <div>
          <h2>{courseQuotes.length ? 'Відгуки учасників курсу' : 'Відгуки про академію'}</h2>
        </div>
        <Link href="/reviews" className="text-link">
          Усі відгуки
        </Link>
      </div>
      <div className="testimonial-pair">
        {testimonials.map((t) => (
          <figure key={t.id}>
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <strong>{t.name}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
