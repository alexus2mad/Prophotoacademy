'use client';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, SyntheticEvent, TouchEvent } from 'react';
import type { StudioHomeMode } from '@/lib/studio-home/types';
import type { HeroTouchOrigin, StudioHomeHeroProps } from './types';

const modes: StudioHomeMode[] = ['studio', 'academy', 'shop'];
const dwell = { studio: 12_000, academy: 9_000, shop: 7_000 };

export function useStudioHomeHero({ mode, onModeChange }: StudioHomeHeroProps) {
  const hero = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const touch = useRef<HeroTouchOrigin | null>(null);
  const loaded = useRef(new Set<string>());
  const [automatic, setAutomatic] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [portrait, setPortrait] = useState(0);
  const [visibleImage, setVisibleImage] = useState('academy-0');
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
    if (!automatic || !playing) return;
    const timer = window.setTimeout(
      () => onModeChange(modes[(modes.indexOf(mode) + 1) % modes.length]),
      dwell[mode],
    );
    return () => window.clearTimeout(timer);
  }, [automatic, mode, onModeChange, playing]);

  useEffect(() => {
    if (!playing || mode !== 'academy') return;
    const timer = window.setInterval(() => setPortrait((current) => (current + 1) % 3), 3_000);
    return () => window.clearInterval(timer);
  }, [mode, playing]);

  function stop() {
    setAutomatic(false);
  }

  function select(next: StudioHomeMode) {
    stop();
    onModeChange(next);
  }

  function onImageLoad(event: SyntheticEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLImageElement)) return;
    const key = event.target.closest<HTMLElement>('[data-hero-visual]')?.dataset.heroVisual;
    if (!key) return;
    loaded.current.add(key);
    if (key === requested.current) setVisibleImage(key);
  }

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    const point = event.touches[0];
    if (!point) return;
    stop();
    touch.current = { x: point.clientX, y: point.clientY };
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    const point = event.changedTouches[0];
    const origin = touch.current;
    touch.current = null;
    if (!point || !origin) return;
    const dx = point.clientX - origin.x;
    const dy = point.clientY - origin.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      select(modes[(modes.indexOf(mode) + (dx < 0 ? 1 : 2)) % modes.length]);
    }
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
    playing,
    stop,
    select,
    onImageLoad,
    onTouchStart,
    onTouchEnd,
    onTabKeyDown,
  };
}
