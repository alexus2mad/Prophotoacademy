'use client';
import { useEffect, useRef, useState } from 'react';

export function useContactCopy(value: string) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );
  async function copy() {
    if (reset.current) clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
      reset.current = setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('failed');
    }
  }
  return { status, copy };
}
