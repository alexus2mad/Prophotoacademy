'use client';
import { useRef, useState } from 'react';
import type { StackPointer } from './types';

export function usePhotoStack(count: number) {
  const [activeIndex, setIndex] = useState(0);
  const pointer = useRef<StackPointer | null>(null);
  const suppressClick = useRef(false);
  const index = count ? activeIndex % count : 0;
  const move = (direction: number) => {
    if (count > 1) setIndex((current) => (current + direction + count) % count);
  };
  const start = (x: number, y: number) => {
    pointer.current = { x, y };
    suppressClick.current = false;
  };
  const cancel = () => {
    pointer.current = null;
    suppressClick.current = true;
  };
  const finish = (x: number, y: number) => {
    const origin = pointer.current;
    pointer.current = null;
    if (!origin) return;
    const dx = x - origin.x;
    const dy = y - origin.y;
    // A swipe or vertical scroll must not also activate the button's click.
    suppressClick.current = Math.hypot(dx, dy) > 8;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  };
  const activate = (detail: number) => {
    // Keyboard/assistive activation has no preceding pointer gesture.
    if (detail === 0 || !suppressClick.current) move(1);
    suppressClick.current = false;
  };
  return { index, move, start, finish, cancel, activate };
}
