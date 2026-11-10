'use client';
import { StudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/StudioHomeCarousel';
import { studioHomeReviews } from '@/lib/studio-home/selectors';
import { studioReviews } from '@/lib/studio-reviews/reviews';
import { useStudioHomeReviews } from './hooks';
import styles from './StudioHomeReviews.module.css';

export function StudioHomeReviews() {
  const { rail, active, maximum, select, onKeyDown, expanded, toggleExpanded } =
    useStudioHomeReviews();
  const reviews = expanded ? studioReviews : studioHomeReviews;
  return (
    <section
      className={`${styles.reviews} studio-wrap`}
      data-home-section="reviews"
      aria-labelledby="home-reviews-title"
    >
      <div className={styles.heading}>
        <h2 className="studio-label" id="home-reviews-title">
          Відгуки учнів
        </h2>
        <blockquote className={styles.quote}>
          «Мій бренд говорить одразу,
          <br /> я <span className="studio-hand">*не залежу</span> від підрядників»
        </blockquote>
        <p className="studio-label">Яна Тітова, власниця бренду взуття ручної роботи</p>
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
          <article className={styles.review} key={review.id}>
            <div className={styles.reviewHeader}>
              <h3>{review.name}</h3>
              <span aria-label="5 з 5">★★★★★</span>
            </div>
            <p className={styles.reviewTitle}>{review.title}</p>
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
