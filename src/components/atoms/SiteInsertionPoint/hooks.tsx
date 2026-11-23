import { useRef } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

// Mobile browsers can omit their compatibility click immediately after a touch drag.
export function useInsertionTap(choose: () => void) {
  const start = useRef<[number, number, number] | null>(null);
  const handled = useRef(false);
  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    handled.current = false;
    start.current =
      event.pointerType === 'mouse' ? null : [event.pointerId, event.clientX, event.clientY];
  }
  function pointerUp(event: PointerEvent<HTMLButtonElement>) {
    const first = start.current;
    start.current = null;
    if (
      !first ||
      first[0] !== event.pointerId ||
      Math.hypot(event.clientX - first[1], event.clientY - first[2]) > 8
    )
      return;
    handled.current = true;
    choose();
  }
  function click(event: MouseEvent<HTMLButtonElement>) {
    if (!handled.current || event.detail === 0) choose();
    handled.current = false;
  }
  return {
    onPointerDown: pointerDown,
    onPointerUp: pointerUp,
    onPointerCancel: () => {
      start.current = null;
    },
    onClick: click,
  };
}
