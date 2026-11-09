'use client';
import { useEffect, useRef, useState } from 'react';

export function useStudioHomeExposure() {
  const section = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 760px)');
    let frame = 0;
    const update = () => {
      if (motion.matches || mobile.matches) {
        setProgress(1);
        return;
      }
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const bounds = section.current?.getBoundingClientRect();
        if (bounds)
          setProgress(
            Math.min(
              1,
              Math.max(
                0,
                (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height * 0.25),
              ),
            ),
          );
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    motion.addEventListener('change', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      motion.removeEventListener('change', update);
      window.cancelAnimationFrame(frame);
    };
  }, []);
  return { section, progress };
}
