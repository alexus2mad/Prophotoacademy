'use client';

import Link from 'next/link';
import { useStudioGallery } from '@/components/organisms/StudioSpacesGallery/hooks';
import type { StudioProgramReviewsProps } from './types';
import styles from './StudioProgramReviews.module.css';

export function StudioProgramReviews({ reviews }: StudioProgramReviewsProps) {
  const { track, position, move, onKeyDown } = useStudioGallery(reviews.length);
  return (
    <section
      className={`${styles.section} studio-light studio-band studio-wrap`}
      id="program-reviews"
      aria-labelledby="program-reviews-title"
    >
      <header className={styles.heading}>
        <p className="studio-label">Відгуки</p>
        <h2 className="studio-title" id="program-reviews-title">
          Що кажуть випускники
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
          <article className={styles.review} key={review.id}>
            <h3>{review.name}</h3>
            {review.kind === 'story' ? (
              <>
                <p className={styles.kind}>Історія від академії</p>
                <p>{review.quote}</p>
              </>
            ) : (
              <blockquote>{review.quote}</blockquote>
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
