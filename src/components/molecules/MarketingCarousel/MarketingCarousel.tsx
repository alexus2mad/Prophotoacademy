'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMarketingCarousel } from './hooks';
import type { MarketingCarouselProps } from './types';
import styles from './MarketingCarousel.module.css';

export function MarketingCarousel({ children, label, count }: MarketingCarouselProps) {
  const { track, index, move } = useMarketingCarousel(count);
  return (
    <div
      role="region"
      aria-label={label}
      aria-roledescription="Карусель"
      className={styles.carousel}
    >
      <ul
        className={styles.track}
        ref={track}
        tabIndex={count > 1 ? 0 : undefined}
        aria-label="Фотографії"
      >
        {children}
      </ul>
      {count > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            aria-label="Попереднє фото"
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <span aria-live="polite" aria-atomic="true">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            aria-label="Наступне фото"
            disabled={index >= count - 1}
            onClick={() => move(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
