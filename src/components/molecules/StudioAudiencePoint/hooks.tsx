import { useState, useSyncExternalStore } from 'react';
import type { SyntheticEvent } from 'react';

function subscribe(onChange: () => void) {
  const screen = window.matchMedia('(min-width: 761px)');
  screen.addEventListener('change', onChange);
  return () => screen.removeEventListener('change', onChange);
}

function desktopSnapshot() {
  return window.matchMedia('(min-width: 761px)').matches;
}

export function useStudioAudiencePoint() {
  const desktop = useSyncExternalStore(subscribe, desktopSnapshot, () => true);
  const [expanded, setExpanded] = useState(false);

  function onToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (!desktop) setExpanded(event.currentTarget.open);
  }

  function onSummaryClick(event: SyntheticEvent) {
    if (desktop) event.preventDefault();
  }

  return { desktop, open: desktop || expanded, onToggle, onSummaryClick };
}
