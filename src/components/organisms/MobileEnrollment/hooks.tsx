'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function useMobileEnrollment() {
  const [visible, setVisible] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const action = document.querySelector('.program-hero-actions');
    const gallery = document.getElementById('student-works');
    if (!action || !('IntersectionObserver' in window)) return;
    const update = () =>
      setVisible(
        action.getBoundingClientRect().bottom <= 88 &&
          (!gallery || gallery.getBoundingClientRect().top >= window.innerHeight),
      );
    const actionObserver = new IntersectionObserver(update, {
      rootMargin: '-88px 0px 0px 0px',
      threshold: 0,
    });
    const galleryObserver = new IntersectionObserver(update, { threshold: 0 });
    actionObserver.observe(action);
    if (gallery) galleryObserver.observe(gallery);
    window.addEventListener('resize', update);
    update();
    return () => {
      actionObserver.disconnect();
      galleryObserver.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [path]);
  return { visible };
}
