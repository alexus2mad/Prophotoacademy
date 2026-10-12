'use client';
import { useEffect, useState } from 'react';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import type { LessonImageViewerProps } from './types';

export function useLessonImageViewer({ initialIndex, images }: LessonImageViewerProps) {
  const { dialog } = useDialog();
  const [index, setIndex] = useState(initialIndex);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, [dialog]);
  return {
    dialog,
    index,
    current: images[index],
    navigate: (direction: number) => {
      if (document.activeElement?.closest('.lesson-image-slide')) {
        dialog.current
          ?.querySelector<HTMLButtonElement>(`[data-gallery-direction="${direction}"]`)
          ?.focus({ preventScroll: true });
      }
      setIndex((value) => (value + direction + images.length) % images.length);
    },
  };
}
