'use client';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import { useState } from 'react';
import type { GalleryProps } from './types';

export function useGallery({ works, images }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const { dialog } = useDialog();
  const current = works[index];
  const image = images.find((i) => i.id === current?.imageId);
  function open(i: number) {
    setIndex(i);
    dialog.current?.showModal();
  }
  return { index, setIndex, dialog, current, image, open };
}
