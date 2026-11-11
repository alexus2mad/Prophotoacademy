'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import { attachImageGallerySwipe } from './swipe';
import type { GalleryDirection } from './types';

export function useImageGallery(length: number) {
  const [index, setIndex] = useState(0);
  const { dialog } = useDialog();
  const move = useCallback(
    (direction: GalleryDirection) => {
      if (length > 1) setIndex((current) => (current + direction + length) % length);
    },
    [length],
  );
  function open(selected: number) {
    if (selected < 0 || selected >= length) return;
    setIndex(selected);
    dialog.current?.showModal();
  }
  return { index, dialog, open, move };
}

export function useImageGalleryControls(onNavigate: (direction: GalleryDirection) => void) {
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (viewport.current) return attachImageGallerySwipe(viewport.current, onNavigate);
  }, [onNavigate]);
  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      onNavigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
  return { viewport, onKeyDown };
}
