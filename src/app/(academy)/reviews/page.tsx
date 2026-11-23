import { ReviewSourceLink } from '@/components/atoms/ReviewSourceLink/ReviewSourceLink';
import Image from 'next/image';
import { getContent } from '@/lib/content';
import type { SiteRouteProps } from '@/lib/site-editor/types';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import { readSitePage } from '@/lib/site-editor/public';
import { reviewsContent } from '@/lib/site-editor/support-pages';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { academyMetadata } from '@/lib/seo/metadata';
export const metadata = academyMetadata('/reviews', {
  title: 'Відгуки студентів',
  description:
    'Читайте відгуки про навчання в ProPhoto Academy: досвід студентів курсів фотографії та візуального контенту та історії випускників.',
});
export default async function Reviews({ searchParams }: SiteRouteProps) {
  const [content, page] = await Promise.all([getContent(), readSitePage('/reviews', searchParams)]);
  const { title, testimonials } = reviewsContent(content, page);
  return (
    <>
      <div className="container">
        <MarketingSlot page={page} id="intro" />
        <div className="page-heading" data-site-section="intro">
          <h1 data-site-field="title">{title}</h1>
        </div>
        <MarketingSlot page={page} id="reviews" />
        <div className="review-grid">
          {testimonials.map((t) => (
            <article className="review-card" data-site-section={'review-' + t.id} key={t.id}>
              {t.kind === 'story' && <p className="eyebrow review-kind">Історія від академії</p>}
              {t.quote &&
                (t.kind === 'story' ? (
                  <p className="review-story" data-site-field="quote">
                    {t.quote}
                  </p>
                ) : (
                  <blockquote>
                    «<span data-site-field="quote">{t.quote}</span>»
                  </blockquote>
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
              <h3 data-site-field="name">{t.name}</h3>
              <ReviewSourceLink className="text-link" source={t.sourceUrl} />
            </article>
          ))}
        </div>
      </div>
      <MarketingSlot page={page} id="inquiry" />
      <Consultation compact />
      <MarketingComposition page={page} />
    </>
  );
}
