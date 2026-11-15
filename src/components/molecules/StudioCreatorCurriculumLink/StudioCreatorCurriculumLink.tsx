'use client';

import { creatorCurriculumId } from '@/lib/studio-creator/content';
import { useOpenCreatorCurriculum } from './hooks';

export function StudioCreatorCurriculumLink() {
  const openCurriculum = useOpenCreatorCurriculum();

  return (
    <a
      href={`#${creatorCurriculumId}`}
      className="studio-button-outline"
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return;
        }
        openCurriculum();
      }}
    >
      Програма
    </a>
  );
}
