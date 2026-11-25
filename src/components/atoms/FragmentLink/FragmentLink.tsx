'use client';
import type { MouseEvent } from 'react';
import type { FragmentLinkProps } from './types';

export function FragmentLink({ targetId, ...props }: FragmentLinkProps) {
  const href = '#' + targetId;

  function followFragment(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    // Next integrates pushState with its router history, including checkout's Back action.
    if (window.location.hash !== href) window.history.pushState(null, '', href);
    target.focus({ preventScroll: true });
    target.scrollIntoView();
  }

  return <a {...props} href={href} onClick={followFragment} />;
}
