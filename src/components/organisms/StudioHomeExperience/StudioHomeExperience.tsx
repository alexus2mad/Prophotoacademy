'use client';
import { StudioHomeHero } from '@/components/organisms/StudioHomeHero/StudioHomeHero';
import { StudioHomeExposure } from '@/components/organisms/StudioHomeExposure/StudioHomeExposure';
import { StudioHomeDirections } from '@/components/organisms/StudioHomeDirections/StudioHomeDirections';
import { useStudioHomeExperience } from './hooks';
import type { StudioHomeExperienceProps } from './types';
import styles from './StudioHomeExperience.module.css';

export function StudioHomeExperience({ directions, children }: StudioHomeExperienceProps) {
  const directionsRef = useStudioHomeExperience();
  return (
    <div className={styles.home} data-home-mode="academy">
      <StudioHomeHero />
      <StudioHomeExposure mode="academy" directionsRef={directionsRef} />
      <StudioHomeDirections mode="academy" directions={directions} sectionRef={directionsRef} />
      {children}
    </div>
  );
}
