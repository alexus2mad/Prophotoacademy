'use client';

import Link from 'next/link';
import { StudioHomeDirectionCard } from '@/components/molecules/StudioHomeDirectionCard/StudioHomeDirectionCard';
import type { StudioHomeDirectionsProps } from './types';
import { useDirectionRail } from './hooks';
import styles from './StudioHomeDirections.module.css';

export function StudioHomeDirections({ directions, sectionRef }: StudioHomeDirectionsProps) {
  const railRef = useDirectionRail();
  return (
    <section
      id="education-id"
      data-home-section="directions"
      ref={sectionRef}
      data-header-tone="light"
      className={`${styles.section} studio-light`}
      aria-labelledby="home-directions-title"
    >
      <div className={`${styles.heading} studio-wrap`}>
        <div>
          <p className="studio-label">Академія</p>
          <h2 className="studio-title" id="home-directions-title">
            Оберіть, як <span className={`studio-hand ${styles.learning}`}>*вчитися</span>
          </h2>
        </div>
        <Link className="studio-button-outline" href="/academy">
          Вся академія
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div
        ref={railRef}
        className={styles.grid}
        tabIndex={0}
        role="region"
        aria-label="Напрями навчання"
      >
        {directions.map((direction) => (
          <StudioHomeDirectionCard key={direction.title} direction={direction} />
        ))}
      </div>
    </section>
  );
}
