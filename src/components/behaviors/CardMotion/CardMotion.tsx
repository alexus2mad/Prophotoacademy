'use client';
import { useCardMotion } from './hooks';
import type { CardMotionProps } from './types';

export function CardMotion({ mode }: CardMotionProps) {
  useCardMotion(mode);
  return null;
}
