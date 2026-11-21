'use client';
import { homeDirections } from '@/lib/site-editor/brand/home/directions';
import { bindSection } from '@/lib/site-editor/bind-section';

import Link from 'next/link';
import { StudioHomeDirectionCard } from '@/components/molecules/StudioHomeDirectionCard/StudioHomeDirectionCard';
import type { StudioHomeDirectionsProps } from './types';
import { useDirectionRail } from './hooks';
import styles from './StudioHomeDirections.module.css';

export function StudioHomeDirections({ page, directions, sectionRef }: StudioHomeDirectionsProps) {
  const { text, image } = bindSection(page, homeDirections);
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
          <p className="studio-label">{text('eyebrow')}</p>
          <h2 className="studio-title" id="home-directions-title">
            {text('title')}{' '}
            <span className={`studio-hand ${styles.learning}`}>{text('emphasis')}</span>
          </h2>
        </div>
        <Link className="studio-button-outline" href="/academy">
          {text('action')}
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
        {directions.map((direction, index) => {
          const id = 'card-' + (index + 1);
          return (
            <StudioHomeDirectionCard
              key={id}
              direction={{
                ...direction,
                title: text(id + '-title'),
                description: text(id + '-description'),
                action: text(id + '-action'),
                image: image(id + '-image', direction.image),
                mobileImage:
                  direction.mobileImage && image(id + '-mobile-image', direction.mobileImage),
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
