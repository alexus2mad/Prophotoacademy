'use client';
import { StudioHomeHero } from '@/components/organisms/StudioHomeHero/StudioHomeHero';
import { StudioHomeExposure } from '@/components/organisms/StudioHomeExposure/StudioHomeExposure';
import { StudioHomeDirections } from '@/components/organisms/StudioHomeDirections/StudioHomeDirections';
import { useStudioHomeExperience } from './hooks';
import type { StudioHomeExperienceProps } from './types';
import styles from './StudioHomeExperience.module.css';

export function StudioHomeExperience({ directions, children }: StudioHomeExperienceProps) {
  const { mode, setMode, directionsRef } = useStudioHomeExperience();
  return (
    <div className={styles.home} data-home-mode={mode}>
      <StudioHomeHero mode={mode} onModeChange={setMode} />
      <StudioHomeExposure mode={mode} directionsRef={directionsRef} />
      <StudioHomeDirections mode={mode} directions={directions} sectionRef={directionsRef} />
      {children}
    </div>
  );
}
