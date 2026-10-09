'use client';
import { useRef } from 'react';

export function useDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  return { dialog };
}
