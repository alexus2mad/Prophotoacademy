'use client';
import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent, TransitionEvent } from 'react';

export function useStudioHomeHero(portraitCount: number) {
  const hero = useRef<HTMLElement>(null);
  const loaded = useRef(new Set<string>());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [portrait, setPortrait] = useState(0);
  const [visibleImage, setVisibleImage] = useState('academy-0');
  const { retainedImages, onImageTransitionEnd } = useHeroImageRetention(
    visibleImage,
    reducedMotion,
  );
  const requestedImage = `academy-${portrait}`;
  const requested = useRef(requestedImage);
  const playing = !reducedMotion && visible && documentVisible;

  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setDocumentVisible(!document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.5] },
    );
    observer.observe(element);
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    updateMotion();
    updateVisibility();
    element.querySelectorAll<HTMLImageElement>('[data-hero-visual] img').forEach((image) => {
      const key = image.closest<HTMLElement>('[data-hero-visual]')?.dataset.heroVisual;
      if (key && image.complete && image.naturalWidth > 0) loaded.current.add(key);
    });
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    requested.current = requestedImage;
    if (loaded.current.has(requestedImage)) setVisibleImage(requestedImage);
  }, [requestedImage]);

  useEffect(() => {
    if (!playing || portraitCount < 2) return;
    const timer = window.setInterval(
      () => setPortrait((current) => (current + 1) % portraitCount),
      3_000,
    );
    return () => window.clearInterval(timer);
  }, [playing, portraitCount]);

  function onImageLoad(event: SyntheticEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLImageElement)) return;
    const key = event.target.closest<HTMLElement>('[data-hero-visual]')?.dataset.heroVisual;
    if (!key) return;
    loaded.current.add(key);
    if (key === requested.current) setVisibleImage(key);
  }

  return { hero, visibleImage, retainedImages, playing, onImageLoad, onImageTransitionEnd };
}

/** Reset a photograph only after it has completely faded, never while it is still visible. */
export function useHeroImageRetention(visibleImage: string, reducedMotion: boolean) {
  const [retainedImages, setRetainedImages] = useState<string[]>([visibleImage]);
  useEffect(() => {
    setRetainedImages((current) =>
      reducedMotion ? [visibleImage] : [...new Set([...current, visibleImage])],
    );
  }, [visibleImage, reducedMotion]);

  function onImageTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    const layer = event.currentTarget;
    if (
      event.target !== layer ||
      event.propertyName !== 'opacity' ||
      layer.dataset.active !== 'false' ||
      getComputedStyle(layer).opacity !== '0'
    )
      return;
    const key = layer.dataset.heroVisual;
    setRetainedImages((current) => current.filter((image) => image !== key));
  }

  return { retainedImages, onImageTransitionEnd };
}
