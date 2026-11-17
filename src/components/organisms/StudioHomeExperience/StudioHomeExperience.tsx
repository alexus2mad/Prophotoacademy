'use client';
import { StudioHomeHero } from '@/components/organisms/StudioHomeHero/StudioHomeHero';
import { StudioHomeExposure } from '@/components/organisms/StudioHomeExposure/StudioHomeExposure';
import { StudioHomeDirections } from '@/components/organisms/StudioHomeDirections/StudioHomeDirections';
import { useStudioHomeExperience } from './hooks';
import type { StudioHomeExperienceProps } from './types';
import styles from './StudioHomeExperience.module.css';

export function StudioHomeExperience({
  directions,
  academy,
  studio,
  shop,
}: StudioHomeExperienceProps) {
  const { mode, selectMode, directionsRef } = useStudioHomeExperience();
  const panels = {
    studio,
    academy: (
      <>
        <StudioHomeExposure directionsRef={directionsRef} />
        <StudioHomeDirections directions={directions} sectionRef={directionsRef} />
        {academy}
      </>
    ),
    shop,
  };
  return (
    <div className={styles.home} data-home-mode={mode}>
      <StudioHomeHero mode={mode} onModeChange={selectMode} />
      {Object.entries(panels).map(([name, panel]) => (
        <div
          key={name}
          className={name === 'academy' ? styles.academy : undefined}
          id={`home-panel-${name}`}
          role="tabpanel"
          aria-labelledby={`home-tab-${name}`}
          hidden={mode !== name}
          tabIndex={mode === name ? 0 : undefined}
        >
          {mode === name && panel}
        </div>
      ))}
    </div>
  );
}
