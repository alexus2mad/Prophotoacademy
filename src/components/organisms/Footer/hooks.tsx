'use client';
import { usePathname } from 'next/navigation';

export function useFooter() {
  const focused = ['/checkout', '/thanks'].includes(usePathname().replace(/\/+$/, '') || '/');
  return { focused };
}
