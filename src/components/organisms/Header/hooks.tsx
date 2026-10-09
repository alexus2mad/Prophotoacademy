'use client';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import { siteHref } from '@/lib/ecosystem';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { HeaderProps } from './types';

export function useHeader({ site = 'academy' }: HeaderProps) {
  const path = usePathname().replace(/\/+$/, '') || '/';
  const [scrolled, setScrolled] = useState(false);
  const { dialog } = useDialog();
  const focused =
    (site === 'hub' && path.endsWith('/booking')) || path === '/checkout' || path === '/thanks';
  const home = site === 'academy' ? path === '/' : path === '/hub' || path === '/';
  const links =
    site === 'hub'
      ? [
          [siteHref('hub', '#spaces'), 'Зали'],
          [siteHref('hub', 'contact'), 'Контакти'],
        ]
      : [
          ['/student-work', 'Роботи студентів'],
          ['/about-us', 'Академія'],
        ];
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    dialog.current?.close();
  }, [path]);
  return { path, scrolled, dialog, focused, home, links };
}
