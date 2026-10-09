'use client';
import { usePathname } from 'next/navigation';

export function useHubFooter() {
  const booking = usePathname().replace(/\/+$/, '').endsWith('/booking');
  return { booking };
}
