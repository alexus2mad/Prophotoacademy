'use client';
import { useState } from 'react';
import type { LessonBodyProps } from './types';

export function useLessonImages({ lesson }: Pick<LessonBodyProps, 'lesson'>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const images = lesson.blocks.filter((block) => block.kind === 'image' && block.mediaId);
  return {
    images,
    selectedIndex: images.findIndex((block) => block.id === selectedId),
    openImage: setSelectedId,
    closeImages: () => setSelectedId(null),
  };
}
