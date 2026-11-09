'use client';
import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

export function useStudioHomeTabs() {
  const tabs = useRef<HTMLDivElement>(null);
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const buttons = Array.from(
      tabs.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const current = buttons.indexOf(event.currentTarget);
    const next =
      event.key === 'ArrowRight'
        ? (current + 1) % buttons.length
        : event.key === 'ArrowLeft'
          ? (current - 1 + buttons.length) % buttons.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : -1;
    if (next >= 0) {
      event.preventDefault();
      buttons[next]?.focus();
    }
  }
  return { tabs, onTabKeyDown };
}
