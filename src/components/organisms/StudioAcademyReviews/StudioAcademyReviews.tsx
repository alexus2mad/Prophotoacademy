'use client';

import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import Link from 'next/link';
import { useStudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/hooks';
import { brandReviewContent } from '@/lib/site-editor/brand/reviews';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import type { StudioAcademyReviewsProps } from './types';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import styles from './StudioAcademyReviews.module.css';

export function StudioAcademyReviews({ page, variant = 'academy' }: StudioAcademyReviewsProps) {
  const { rail, active, maximum, select, onKeyDown } = useStudioHomeCarousel();

  const copy = brandReviewContent(variant, page);
  return (
    <section
      data-site-section="reviews-heading"
      id={variant === 'creator' ? 'program-reviews' : undefined}
      className="studio-band studio-dark"
      aria-labelledby="academy-reviews-title"
    >
      <div className="studio-wrap">
        {variant === 'creator' ? (
          <StudioCreatorHeading
            id="academy-reviews-title"
            label={<SiteCopy id="eyebrow">{copy.label}</SiteCopy>}
          >
            <SiteCopy id="title">{copy.title}</SiteCopy>{' '}
            <span className="studio-hand" data-site-field="accent">
              {copy.accent}
            </span>
          </StudioCreatorHeading>
        ) : (
          <header className={styles.heading}>
            <p data-site-field="eyebrow" className="studio-label studio-eyebrow">
              {copy.label}
            </p>
            <h2 data-site-field="title" className="studio-title" id="academy-reviews-title">
              {copy.title}
            </h2>
          </header>
        )}
        <div
          id="academy-reviews"
          className={styles.rail}
          ref={rail}
          tabIndex={0}
          role="region"
          aria-label="Відгуки випускників"
          onKeyDown={onKeyDown}
        >
          {copy.reviews.map((review) => (
            <article
              data-site-section={'review-' + review.id}
              className={styles.review}
              key={review.id}
            >
              <header>
                <h3 data-site-field="name">{review.name}</h3>
                {variant === 'creator' ? (
                  <img
                    src={studioAssetUrl('/images/studio/creator/review-stars-088b2ea487ba.svg')}
                    alt="5 із 5"
                  />
                ) : (
                  <span aria-label="5 із 5">★★★★★</span>
                )}
              </header>
              <p data-site-field="title" className={styles.title}>
                {review.title}
              </p>
              {review.kind === 'story' ? (
                <div className={styles.body}>
                  <p className={styles.kind}>Історія від академії</p>
                  <p data-site-field="quote">{review.quote}</p>
                </div>
              ) : (
                <blockquote data-site-field="quote" className={styles.body}>
                  {review.quote}
                </blockquote>
              )}
              <a className={styles.source} href={review.sourceUrl} target="_blank" rel="noreferrer">
                Переглянути оригінал
              </a>
            </article>
          ))}
        </div>
        <div className={styles.controls}>
          <div>
            <button
              type="button"
              aria-label="Попередній відгук"
              aria-controls="academy-reviews"
              disabled={active === 0}
              onClick={() => select(active - 1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Наступний відгук"
              aria-controls="academy-reviews"
              disabled={active >= maximum}
              onClick={() => select(active + 1)}
            >
              →
            </button>
          </div>
          <Link href="/reviews">Усі відгуки</Link>
        </div>
      </div>
    </section>
  );
}
