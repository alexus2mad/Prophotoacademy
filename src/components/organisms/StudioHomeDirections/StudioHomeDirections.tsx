'use client';

import Link from 'next/link';
import { StudioHomeDirectionCard } from '@/components/molecules/StudioHomeDirectionCard/StudioHomeDirectionCard';
import { studioHomeRooms } from '@/lib/studio-home/selectors';
import type { StudioDirectionTransitionStyle, StudioHomeDirectionsProps } from './types';
import { useDirectionRail } from './hooks';
import styles from './StudioHomeDirections.module.css';

export function StudioHomeDirections({
  mode,
  directions,
  transitionProgress,
}: StudioHomeDirectionsProps) {
  const isStudio = mode === 'studio';
  const railRef = useDirectionRail(mode);
  const transitionStyle: StudioDirectionTransitionStyle | undefined =
    transitionProgress === undefined ? undefined : { '--mobile-exposure': transitionProgress };
  return (
    <section
      data-home-section="directions"
      data-header-tone={
        transitionProgress === undefined || transitionProgress >= 0.5 ? 'light' : 'dark'
      }
      style={transitionStyle}
      className={`${styles.section} studio-light`}
      aria-labelledby="home-directions-title"
    >
      <div className={`${styles.heading} studio-wrap`}>
        <div>
          <p className="studio-label">{isStudio ? 'Студія' : 'Академія'}</p>
          <h2 className="studio-title" id="home-directions-title">
            {isStudio ? 'Оберіть' : 'Оберіть, як'}{' '}
            <span className={`studio-hand ${!isStudio ? styles.learning : ''}`}>
              *{isStudio ? 'зал' : 'вчитися'}
            </span>
          </h2>
        </div>
        <Link className="studio-button-outline" href={isStudio ? '/photo-studio' : '/academy'}>
          {isStudio ? 'Уся студія' : 'Вся академія'}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div
        ref={railRef}
        className={`${styles.grid} ${isStudio ? styles.rooms : ''}`}
        tabIndex={0}
        role="region"
        aria-label={isStudio ? 'Зали студії' : 'Напрями навчання'}
      >
        {(isStudio ? studioHomeRooms : directions).map((direction) => (
          <StudioHomeDirectionCard key={direction.title} direction={direction} />
        ))}
      </div>
    </section>
  );
}
