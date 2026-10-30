'use client';
import { usePathname } from 'next/navigation';

export function useFooter() {
  const path = usePathname().replace(/\/+$/, '') || '/';
  const focused = ['/checkout', '/thanks'].includes(path);
  return { focused, path };
}
