'use client';

import { ReviewSourceLink } from '@/components/atoms/ReviewSourceLink/ReviewSourceLink';
import Link from 'next/link';
import { programReviewContent } from '@/lib/site-editor/brand/reviews';
import { useStudioGallery } from '@/components/behaviors/GalleryRail/hooks';
import type { StudioProgramReviewsProps } from './types';
import styles from './StudioProgramReviews.module.css';

export function StudioProgramReviews({ reviews: originals, page }: StudioProgramReviewsProps) {
  const { reviews, label, title } = programReviewContent(originals, page);
  const { track, position, move, onKeyDown } = useStudioGallery(reviews.length);
  return (
    <section
      className={`${styles.section} studio-light studio-band studio-wrap`}
      id="program-reviews"
      aria-labelledby="program-reviews-title"
    >
      <header data-site-section="reviews-heading" className={styles.heading}>
        <p data-site-field="eyebrow" className="studio-label">
          {label}
        </p>
        <h2 data-site-field="title" className="studio-title" id="program-reviews-title">
          {title}
        </h2>
      </header>
      <div
        className={styles.rail}
        ref={track}
        tabIndex={0}
        role="region"
        aria-label="Відгуки випускників"
        onKeyDown={onKeyDown}
      >
        {reviews.map((review) => (
          <article
            data-site-section={'review-' + review.id}
            className={styles.review}
            key={review.id}
          >
            <h3 data-site-field="name">{review.name}</h3>
            {review.kind === 'story' ? (
              <>
                <p className={styles.kind}>Історія від академії</p>
                <p data-site-field="quote">{review.quote}</p>
              </>
            ) : (
              <blockquote data-site-field="quote">{review.quote}</blockquote>
            )}
            <ReviewSourceLink
              className={styles.source}
              source={review.sourceUrl}
              indexLabel="Перейти до всіх відгуків"
            />
          </article>
        ))}
      </div>
      <div className={styles.controls}>
        <div>
          <button
            type="button"
            aria-label="Попередній відгук"
            disabled={position.start}
            onClick={() => move(-1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Наступний відгук"
            disabled={position.end}
            onClick={() => move(1)}
          >
            →
          </button>
        </div>
        <Link href="/reviews">Усі відгуки</Link>
      </div>
    </section>
  );
}
