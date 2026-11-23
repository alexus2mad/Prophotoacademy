'use client';
import { useEffect, useRef, useState } from 'react';

export function useMarketingCarousel(count: number) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const list = track.current;
    if (!list) return;
    function measure() {
      if (!list || !list.children.length) return;
      const left = list.getBoundingClientRect().left;
      const distances = Array.from(list.children, (item) =>
        Math.abs(item.getBoundingClientRect().left - left),
      );
      setIndex(distances.indexOf(Math.min(...distances)));
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener('scroll', measure);
    };
  }, [count]);
  function move(direction: number) {
    const list = track.current;
    const item = list?.children[index + direction];
    if (!list || !item) return;
    const reduced = list.ownerDocument.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    list.scrollBy({
      left: item.getBoundingClientRect().left - list.getBoundingClientRect().left,
      behavior: reduced ? 'instant' : 'smooth',
    });
  }
  return { track, index, move };
}
