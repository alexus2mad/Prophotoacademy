'use client';
import { useEffect, useState } from 'react';

export function useSelectedChapter(lessonId: string) {
  const [hash, setHash] = useState('');
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [lessonId]);
  return hash;
}
