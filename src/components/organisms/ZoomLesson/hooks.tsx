'use client';
import { useEffect, useState } from 'react';
import { liveStatus } from '@/lib/learning/access';
import type { ZoomLessonProps } from './types';
export function useZoomLesson({ session }: ZoomLessonProps) {
  const [zone, setZone] = useState('Europe/Kyiv'),
    [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  return {
    zone,
    status: session
      ? liveStatus(session.starts_at, session.ends_at, session.status, now)
      : 'upcoming',
  };
}
