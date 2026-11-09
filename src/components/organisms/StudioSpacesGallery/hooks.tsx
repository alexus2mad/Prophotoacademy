'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

export function useStudioGallery(length: number) {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ index: 1, start: true, end: length < 2 });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const first = element.firstElementChild;
      const width = first?.getBoundingClientRect().width || element.clientWidth;
      setPosition({
        index: Math.min(length, Math.round(element.scrollLeft / (width + 2)) + 1),
        start: element.scrollLeft < 2,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, [length]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const width = element.firstElementChild?.getBoundingClientRect().width || element.clientWidth;
    element.scrollBy({
      left: direction * (width + 2),
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
