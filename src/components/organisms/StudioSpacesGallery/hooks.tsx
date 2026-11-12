'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { galleryImageTarget, nearestGalleryImage } from './position';
import { createHorizontalRailDrag } from '@/components/behaviors/HorizontalRail/drag';
import type { HorizontalRailController } from '@/components/behaviors/HorizontalRail/types';

function imageOffsets(element: HTMLDivElement) {
  const left = element.getBoundingClientRect().left;
  return Array.from(
    element.children,
    (image) => image.getBoundingClientRect().left - left + element.scrollLeft,
  );
}

export function useStudioGallery(length: number, draggable = false) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<HorizontalRailController | undefined>(undefined);
  const [position, setPosition] = useState({ index: 1, start: true, end: length < 2 });
  useEffect(() => {
    if (!draggable || !track.current) return;
    const controller = createHorizontalRailDrag(track.current, { inertia: true });
    drag.current = controller;
    return () => {
      controller?.destroy();
      drag.current = undefined;
    };
  }, [draggable]);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
      setPosition({
        index: end ? length : nearestGalleryImage(imageOffsets(element), element.scrollLeft) + 1,
        start: element.scrollLeft < 4,
        end,
      });
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    for (const image of element.children) resize.observe(image);
    return () => {
      element.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, [length]);
  const move = (direction: number) => {
    drag.current?.cancelMomentum();
    const element = track.current;
    if (!element) return;
    element.scrollTo({
      left: galleryImageTarget(imageOffsets(element), element.scrollLeft, direction),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };
  return { track, position, move, onKeyDown };
}
