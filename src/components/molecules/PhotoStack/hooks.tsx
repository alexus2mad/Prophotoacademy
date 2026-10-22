'use client';
import { useRef, useState } from 'react';
import type { StackPointer } from './types';

export function usePhotoStack(count: number) {
  const [index, setIndex] = useState(0);
  const pointer = useRef<StackPointer | null>(null);
  const move = (direction: number) => setIndex((current) => (current + direction + count) % count);
  const start = (x: number, y: number) => {
    pointer.current = { x, y };
  };
  const cancel = () => {
    pointer.current = null;
  };
  const finish = (x: number, y: number) => {
    const origin = pointer.current;
    cancel();
    if (!origin || count < 2) return;
    const dx = x - origin.x;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(y - origin.y) * 1.5) move(dx < 0 ? 1 : -1);
  };
  return { index, move, start, finish, cancel };
}
