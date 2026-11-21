import Image from 'next/image';
import { getContent } from '@/lib/content';
import type { SiteRouteProps } from '@/lib/site-editor/types';
import { readSitePage } from '@/lib/site-editor/public';
import { reviewsContent } from '@/lib/site-editor/support-pages';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { academyMetadata } from '@/lib/seo/metadata';
export const metadata = academyMetadata('/reviews', {
  title: 'Відгуки студентів',
  description:
    'Читайте відгуки про навчання в ProPhoto Academy: досвід студентів курсів фотографії та візуального контенту, історії та посилання на оригінали.',
});
export default async function Reviews({ searchParams }: SiteRouteProps) {
  const { title, testimonials } = reviewsContent(
    await getContent(),
    await readSitePage('/reviews', searchParams),
  );
  return (
    <>
      <div className="container">
        <div className="page-heading">
          <h1>{title}</h1>
        </div>
        <div className="review-grid">
          {testimonials.map((t) => (
            <article className="review-card" key={t.id}>
              {t.kind === 'story' && <p className="eyebrow review-kind">Історія від академії</p>}
              {t.quote &&
                (t.kind === 'story' ? (
                  <p className="review-story">{t.quote}</p>
                ) : (
                  <blockquote>«{t.quote}»</blockquote>
                ))}
              {t.image && (
                <Image
                  src={t.image}
                  alt={t.alt}
                  width={800}
                  height={1000}
                  sizes="(max-width:767px) 88vw, 44vw"
                />
              )}
              <h3>{t.name}</h3>
              <a className="text-link" href={t.sourceUrl} target="_blank" rel="noreferrer">
                Переглянути оригінал
              </a>
            </article>
          ))}
        </div>
      </div>
      <Consultation compact />
    </>
  );
}
