'use client';
import Link from 'next/link';
import type { FragmentLinkProps } from './types';

export function FragmentLink({ targetId, ...props }: FragmentLinkProps) {
  return (
    <Link
      {...props}
      href={'#' + targetId}
      onNavigate={() => document.getElementById(targetId)?.focus({ preventScroll: true })}
    />
  );
}
