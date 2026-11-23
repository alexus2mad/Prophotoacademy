'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

export function useFoodBenefitStack(count: number) {
  const rail = useRef<HTMLOListElement>(null);
  const interval = useRef(0);
  const [index, setIndex] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const list = rail.current;
    if (!list) return;

    function readPosition() {
      if (!list || !interval.current) return;
      const nearest = Math.round(list.scrollLeft / interval.current);
      setIndex(Math.min(count - 1, Math.max(0, nearest)));
    }

    function measure() {
      if (!list) return;
      const range = Math.max(0, list.scrollWidth - list.clientWidth);
      // All cards share a width and each snap reveals the same strip of its predecessor.
      interval.current = count > 1 ? range / (count - 1) : 0;
      setScrollable(interval.current > 0);
      readPosition();
    }

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(list);
    list.addEventListener('scroll', readPosition, { passive: true });
    return () => {
      resize.disconnect();
      list.removeEventListener('scroll', readPosition);
    };
  }, [count]);

  function select(nextIndex: number) {
    const list = rail.current;
    if (!list || !interval.current) return;
    const target = Math.min(count - 1, Math.max(0, nextIndex));
    const reduced = list.ownerDocument.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    list.scrollTo({ left: target * interval.current, behavior: reduced ? 'instant' : 'smooth' });
  }

  function onKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    if (
      !scrollable ||
      event.target !== event.currentTarget ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const keys: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: count - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(keys[event.key]);
  }

  return { rail, index, scrollable, select, onKeyDown };
}
