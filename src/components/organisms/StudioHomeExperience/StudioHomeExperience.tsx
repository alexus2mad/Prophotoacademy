'use client';
import { StudioHomeHero } from '@/components/organisms/StudioHomeHero/StudioHomeHero';
import { StudioHomeExposure } from '@/components/organisms/StudioHomeExposure/StudioHomeExposure';
import { StudioHomeDirections } from '@/components/organisms/StudioHomeDirections/StudioHomeDirections';
import { useStudioHomeExperience } from './hooks';
import type { StudioHomeExperienceProps } from './types';
import styles from './StudioHomeExperience.module.css';

export function StudioHomeExperience({ directions, children }: StudioHomeExperienceProps) {
  const { mode, setMode, section, exposure, ready } = useStudioHomeExperience();
  return (
    <div className={styles.home} data-home-mode={mode}>
      <StudioHomeHero mode={mode} onModeChange={setMode} />
      <StudioHomeExposure section={section} exposure={exposure} ready={ready} />
      <StudioHomeDirections
        mode={mode}
        directions={directions}
        transition={ready ? exposure.transition : undefined}
      />
      {children}
    </div>
  );
}
