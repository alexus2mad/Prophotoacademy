'use client';
import type { StudioHomeCarouselProps } from './types';
import styles from './StudioHomeCarousel.module.css';

export function StudioHomeCarousel({
  count,
  active,
  previousDisabled,
  nextDisabled,
  onSelect,
  label,
  className = '',
}: StudioHomeCarouselProps) {
  return (
    <div className={`${styles.controls} ${className}`} aria-label={label}>
      <button
        type="button"
        className={styles.arrow}
        disabled={previousDisabled}
        onClick={() => onSelect(active - 1)}
        aria-label={`Попередні ${label.toLowerCase()}`}
      >
        ←
      </button>
      <div className={styles.dots}>
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${label}: сторінка ${index + 1}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => onSelect(index)}
          >
            <span />
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.arrow}
        disabled={nextDisabled}
        onClick={() => onSelect(active + 1)}
        aria-label={`Наступні ${label.toLowerCase()}`}
      >
        →
      </button>
    </div>
  );
}
