'use client';

import { useDialog } from '@/components/molecules/Dialog/hooks';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useStudioHeader() {
  const path = usePathname().replace(/\/+$/, '') || '/';
  const { dialog } = useDialog();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const focused = path === '/checkout' || path === '/thanks';
  const darkHero = ['/', '/photo-studio', '/shop', '/ai-artwork'].includes(path);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

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

  return { path, dialog, open, scrolled, focused, darkHero, openMenu, closeMenu };
}
