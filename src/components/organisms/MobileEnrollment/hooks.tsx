'use client';
import { useEffect, useState } from 'react';

export function useMobileEnrollment() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const action = document.querySelector('.program-hero-actions');
    if (!action || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 88),
      { rootMargin: '-88px 0px 0px 0px', threshold: 0 },
    );
    observer.observe(action);
    return () => observer.disconnect();
  }, []);
  return { visible };
}
