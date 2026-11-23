'use client';
import { ReviewSourceLink } from '@/components/atoms/ReviewSourceLink/ReviewSourceLink';
import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { StudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/StudioHomeCarousel';
import { studioHomeReviews } from '@/lib/studio-home/selectors';
import { brandReviewContent } from '@/lib/site-editor/brand/reviews';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import { useStudioHomeReviews } from './hooks';
import styles from './StudioHomeReviews.module.css';

export function StudioHomeReviews({ page }: BrandContentProps = {}) {
  const { rail, active, maximum, select, onKeyDown, expanded, toggleExpanded } =
    useStudioHomeReviews();
  const copy = brandReviewContent('home', page);
  const reviews = expanded ? copy.reviews : copy.reviews.slice(0, studioHomeReviews.length);
  return (
    <section
      className={`${styles.reviews} studio-wrap`}
      data-home-section="reviews"
      aria-labelledby="home-reviews-title"
    >
      <div className={styles.heading} data-site-section="reviews-heading">
        <h2 data-site-field="eyebrow" className="studio-label" id="home-reviews-title">
          {copy.label}
        </h2>
        <blockquote className={styles.quote}>
          <SiteCopy id="title">{copy.title}</SiteCopy>
          <br /> <SiteCopy id="prefix">{copy.prefix}</SiteCopy>{' '}
          <span data-site-field="accent" className="studio-hand">
            {copy.accent}
          </span>{' '}
          <SiteCopy id="end">{copy.end}</SiteCopy>
        </blockquote>
        <p data-site-field="author" className="studio-label">
          {copy.credit}
        </p>
      </div>
      <div
        id="home-reviews"
        className={`${styles.rail} ${expanded ? styles.expanded : ''}`}
        ref={rail}
        tabIndex={expanded ? undefined : 0}
        onKeyDown={expanded ? undefined : onKeyDown}
        role="region"
        aria-label="Відгуки студентів"
      >
        {reviews.map((review) => (
          <article
            data-site-section={'review-' + review.id}
            className={styles.review}
            key={review.id}
          >
            <div className={styles.reviewHeader}>
              <h3 data-site-field="name">{review.name}</h3>
              <span aria-label="5 з 5">★★★★★</span>
            </div>
            <p data-site-field="title" className={styles.reviewTitle}>
              {review.title}
            </p>
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
      {!expanded && (
        <StudioHomeCarousel
          count={studioHomeReviews.length}
          active={active}
          previousDisabled={active === 0}
          nextDisabled={active >= maximum}
          onSelect={select}
          label="Відгуки"
          className={styles.mobileControls}
        />
      )}
      <div className={styles.navigation}>
        {!expanded && (
          <div className={styles.arrows}>
            <button
              type="button"
              disabled={expanded || active === 0}
              aria-label="Попередній відгук"
              onClick={() => select(active - 1)}
            >
              ←
            </button>
            <button
              type="button"
              disabled={expanded || active >= maximum}
              aria-label="Наступний відгук"
              onClick={() => select(active + 1)}
            >
              →
            </button>
          </div>
        )}
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="home-reviews"
          onClick={toggleExpanded}
          className={styles.expand}
        >
          {expanded ? 'Згорнути' : 'Усі відгуки'}
        </button>
      </div>
    </section>
  );
}
