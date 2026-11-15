'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

function carouselLayout(element: HTMLDivElement, groupSize: number) {
  const first = element.firstElementChild;
  const flattened = groupSize > 1 && first && getComputedStyle(first).display === 'contents';
  const item = flattened ? first.firstElementChild : first;
  const pageSize = flattened ? groupSize : 1;
  const finalGroupSize = flattened ? (element.lastElementChild?.childElementCount ?? 0) : 1;
  const count = Math.max(0, (element.childElementCount - 1) * pageSize + finalGroupSize);
  const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
  const step = item ? item.getBoundingClientRect().width + gap : 0;
  const scrollable = Math.max(0, element.scrollWidth - element.clientWidth);
  const last = step > 0 ? Math.min(count - 1, Math.ceil(scrollable / step)) : 0;
  const current =
    step > 0 && element.scrollLeft < scrollable - 2
      ? Math.min(last, Math.round(element.scrollLeft / step))
      : last;
  return { pageSize, step, last, current, scrollable };
}

function scrollToItem(
  element: HTMLDivElement,
  index: number,
  { step, last, scrollable }: ReturnType<typeof carouselLayout>,
) {
  element.scrollTo({
    left: index >= last ? scrollable : Math.max(0, index) * step,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

export function useStudioHomeCarousel(groupSize = 1) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [maximum, setMaximum] = useState(0);
  const measure = useCallback(() => {
    const element = rail.current;
    if (!element) return;
    const { current, last, pageSize } = carouselLayout(element, groupSize);
    setMaximum(Math.floor(last / pageSize));
    setActive(Math.floor(current / pageSize));
  }, [groupSize]);
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
    if (!element) return;
    const layout = carouselLayout(element, groupSize);
    scrollToItem(element, index * layout.pageSize, layout);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (event.target !== element) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const layout = carouselLayout(element, groupSize);
      scrollToItem(element, layout.current + (event.key === 'ArrowRight' ? 1 : -1), layout);
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const layout = carouselLayout(element, groupSize);
      scrollToItem(element, event.key === 'Home' ? 0 : layout.last, layout);
    }
  }
  return { rail, active, maximum, select, onKeyDown };
}
