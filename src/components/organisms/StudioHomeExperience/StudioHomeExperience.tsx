'use client';
import { StudioHomeHero } from '@/components/organisms/StudioHomeHero/StudioHomeHero';
import { StudioHomeExposure } from '@/components/organisms/StudioHomeExposure/StudioHomeExposure';
import { StudioHomeDirections } from '@/components/organisms/StudioHomeDirections/StudioHomeDirections';
import { useStudioHomeExperience } from './hooks';
import type { StudioHomeExperienceProps } from './types';
import styles from './StudioHomeExperience.module.css';

export function StudioHomeExperience({ directions, children }: StudioHomeExperienceProps) {
  const { mode, setMode, section, exposure, ready, compact } = useStudioHomeExperience();
  return (
    <div className={styles.home} data-home-mode={mode}>
      <StudioHomeHero mode={mode} onModeChange={setMode} />
      <StudioHomeExposure section={section} exposure={exposure} ready={ready} compact={compact} />
      <StudioHomeDirections
        mode={mode}
        directions={directions}
        transitionProgress={compact && ready ? exposure.progress : undefined}
      />
      {children}
    </div>
  );
}
