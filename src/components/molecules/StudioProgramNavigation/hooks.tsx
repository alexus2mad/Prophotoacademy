'use client';
import { useEffect, useRef, useState } from 'react';
import type { StudioProgramNavigationLink } from './types';

export function useStudioProgramNavigation(links: readonly StudioProgramNavigationLink[]) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    for (const [href] of links) {
      const section = document.getElementById(href.slice(1));
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    const element = rail.current;
    const current = element?.querySelector<HTMLAnchorElement>('[aria-current="location"]');
    if (!element || !current || element.scrollWidth <= element.clientWidth) return;
    const offset = current.getBoundingClientRect().left - element.getBoundingClientRect().left;
    element.scrollTo({
      left: element.scrollLeft + offset - (element.clientWidth - current.offsetWidth) / 2,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [active]);

  return { rail, active };
}
