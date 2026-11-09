'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

export function useStudioHomeCarousel() {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [maximum, setMaximum] = useState(0);
  const measure = useCallback(() => {
    const element = rail.current;
    if (!element) return;
    const item = element.firstElementChild;
    const step = item
      ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap || '0')
      : element.clientWidth;
    const scrollable = Math.max(0, element.scrollWidth - element.clientWidth);
    const last = step > 0 ? Math.ceil(scrollable / step) : 0;
    setMaximum(last);
    setActive(
      step > 0
        ? element.scrollLeft >= scrollable - 2
          ? last
          : Math.min(last, Math.round(element.scrollLeft / step))
        : 0,
    );
  }, []);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener('scroll', measure, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, [measure]);
  function select(index: number) {
    const element = rail.current;
    const first = element?.firstElementChild;
    if (!element || !first) return;
    const step =
      first.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap || '0');
    element.scrollTo({
      left: Math.max(0, Math.min(maximum, index)) * step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      select(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      select(event.key === 'Home' ? 0 : maximum);
    }
  }
  return { rail, active, maximum, select, onKeyDown };
}
