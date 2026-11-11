'use client';
import { academyIndexPath } from '@/lib/navigation/academy';
import { usePathname } from 'next/navigation';

export function useFooter() {
  const pathname = usePathname().replace(/\/+$/, '') || '/';
  const path = pathname === '/courses' ? academyIndexPath : pathname;
  const focused = ['/checkout', '/thanks'].includes(path);
  return { focused, path };
}
