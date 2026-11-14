'use client';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, SyntheticEvent, TransitionEvent } from 'react';
import type { StudioHomeHeroProps } from './types';

export function useStudioHomeHero({ mode }: StudioHomeHeroProps) {
  const hero = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
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
  const requestedImage = mode === 'academy' ? `academy-${portrait}` : mode;
  const requested = useRef(requestedImage);
  const playing = !reducedMotion && visible && documentVisible;

  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setDocumentVisible(!document.hidden);
    const updateSize = () => {
      element.style.setProperty('--hero-width', `${element.clientWidth}px`);
      element.style.setProperty('--hero-height', `${element.clientHeight}px`);
    };
    const resize = new ResizeObserver(updateSize);
    resize.observe(element);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.5] },
    );
    observer.observe(element);
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    updateMotion();
    updateVisibility();
    updateSize();
    element.querySelectorAll<HTMLImageElement>('[data-hero-visual] img').forEach((image) => {
      const key = image.closest<HTMLElement>('[data-hero-visual]')?.dataset.heroVisual;
      if (key && image.complete && image.naturalWidth > 0) loaded.current.add(key);
    });
    return () => {
      resize.disconnect();
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
    if (!playing || mode !== 'academy') return;
    const timer = window.setInterval(() => setPortrait((current) => (current + 1) % 3), 3_000);
    return () => window.clearInterval(timer);
  }, [playing, mode]);

  function onImageLoad(event: SyntheticEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLImageElement)) return;
    const key = event.target.closest<HTMLElement>('[data-hero-visual]')?.dataset.heroVisual;
    if (!key) return;
    loaded.current.add(key);
    if (key === requested.current) setVisibleImage(key);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const buttons = Array.from(
      tabs.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const current = buttons.indexOf(event.currentTarget);
    const next =
      event.key === 'ArrowRight'
        ? (current + 1) % buttons.length
        : event.key === 'ArrowLeft'
          ? (current - 1 + buttons.length) % buttons.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : -1;
    if (next >= 0) {
      event.preventDefault();
      buttons[next]?.focus();
    }
  }

  return {
    hero,
    tabs,
    visibleImage,
    retainedImages,
    playing,
    onImageLoad,
    onImageTransitionEnd,
    onTabKeyDown,
  };
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
