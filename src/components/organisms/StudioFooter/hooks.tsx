'use client';

import { usePathname } from 'next/navigation';

export function useStudioFooter() {
  const path = usePathname().replace(/\/+$/, '') || '/';
  return { focused: path === '/checkout' || path === '/thanks', home: path === '/' };
}
