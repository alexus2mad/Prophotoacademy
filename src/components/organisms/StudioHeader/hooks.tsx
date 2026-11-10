'use client';

import { useDialog } from '@/components/molecules/Dialog/hooks';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { headerUsesInk } from './presentation';
import type { HeaderControlTones } from './types';

export function useStudioHeader() {
  const path = usePathname().replace(/\/+$/, '') || '/';
  const { dialog } = useDialog();
  const header = useRef<HTMLElement>(null);
  const [controlTones, setControlTones] = useState<HeaderControlTones>({});
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const focused = path === '/checkout' || path === '/thanks';
  const darkHero = ['/', '/photo-studio', '/shop', '/ai-artwork'].includes(path);
  const secondary = ['/academy', '/photo-studio', '/shop', '/contacts'].includes(path);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
      if (focused || open || !header.current) return;
      const next: HeaderControlTones = {};
      for (const control of header.current.querySelectorAll<HTMLElement>('[data-header-control]')) {
        const bounds = control.getBoundingClientRect();
        if (!bounds.width || !bounds.height) continue;
        const underneath = document
          .elementsFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
          .find((element) => !element.closest('.studio-header'));
        const surface = underneath?.closest(
          '[data-header-tone], [data-home-section], .studio-dark, .studio-light, .studio-form-section, .studio-footer',
        );
        next[control.dataset.headerControl!] = headerUsesInk(surface ?? undefined, !darkHero);
      }
      setControlTones((current) =>
        Object.keys(next).every((key) => current[key] === next[key]) ? current : next,
      );
    };
    const update = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('pageshow', update);
    window.addEventListener('focusin', update);
    window.addEventListener('focusout', update);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.addEventListener('change', update);
    const observer = new MutationObserver(update);
    const main = document.getElementById('main');
    if (main)
      observer.observe(main, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', update);
      window.removeEventListener('focusin', update);
      window.removeEventListener('focusout', update);
      reducedMotion.removeEventListener('change', update);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [path, darkHero, focused, open]);

  useEffect(() => {
    dialog.current?.close();
    setOpen(false);
  }, [path, dialog]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const openMenu = () => {
    dialog.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => {
    dialog.current?.close();
    setOpen(false);
  };

  const usesInk = (control: string) => controlTones[control] ?? !darkHero;
  return {
    path,
    header,
    dialog,
    open,
    scrolled,
    focused,
    darkHero,
    secondary,
    usesInk,
    openMenu,
    closeMenu,
  };
}
