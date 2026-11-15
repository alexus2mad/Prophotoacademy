import { useEffect } from 'react';
import { creatorCurriculumId } from '@/lib/studio-creator/content';

function openCurriculum() {
  const disclosure = document
    .getElementById(creatorCurriculumId)
    ?.querySelector<HTMLDetailsElement>(':scope > details');
  if (disclosure) disclosure.open = true;
}

export function useOpenCreatorCurriculum() {
  useEffect(() => {
    const openFromFragment = () => {
      if (window.location.hash === `#${creatorCurriculumId}`) openCurriculum();
    };
    openFromFragment();
    window.addEventListener('hashchange', openFromFragment);
    return () => window.removeEventListener('hashchange', openFromFragment);
  }, []);

  return openCurriculum;
}
