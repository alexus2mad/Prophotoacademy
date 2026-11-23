'use client';

import type { CSSProperties } from 'react';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import { useFoodBenefitStack } from './hooks';
import type { StudioFoodBenefitsProps } from './types';
import styles from './StudioFoodBenefits.module.css';

const number = (value: number) => String(value).padStart(2, '0');

export function StudioFoodBenefits({ items }: StudioFoodBenefitsProps) {
  const { rail, index, scrollable, select, onKeyDown } = useFoodBenefitStack(items.length);
  const total = number(items.length);

  return (
    <section
      className={`${styles.section} studio-dark studio-band studio-wrap`}
      data-site-section="benefits"
      aria-labelledby="creator-benefits-title"
    >
      <StudioCreatorHeading id="creator-benefits-title">
        Чому <span className="studio-hand">*цей курс</span>
      </StudioCreatorHeading>
      <ol
        ref={rail}
        id="food-benefits"
        className={styles.rail}
        aria-label="Переваги курсу"
        tabIndex={scrollable ? 0 : undefined}
        onKeyDown={onKeyDown}
        style={{ '--previous-cards': Math.max(0, items.length - 1) } as CSSProperties}
      >
        {items.map((item, i) => (
          <li
            key={i}
            className={styles.card}
            style={{ '--card-index': i } as CSSProperties}
            data-passed={i < index ? '' : undefined}
          >
            <div className={styles.sheet}>
              <div className={styles.marker} aria-hidden="true">
                <span>
                  {number(i + 1)} / {total}
                </span>
                <span>Перевага</span>
              </div>
              <h3 data-site-field={'title-' + i}>{item.title}</h3>
              <p data-site-field={'text-' + i}>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
      {scrollable && (
        <div className={styles.controls}>
          <button
            type="button"
            aria-label="Попередня перевага"
            aria-controls="food-benefits"
            disabled={index === 0}
            onClick={() => select(index - 1)}
          >
            ←
          </button>
          <span aria-live="polite" aria-atomic="true">
            {number(index + 1)} / {total}
          </span>
          <button
            type="button"
            aria-label="Наступна перевага"
            aria-controls="food-benefits"
            disabled={index === items.length - 1}
            onClick={() => select(index + 1)}
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
