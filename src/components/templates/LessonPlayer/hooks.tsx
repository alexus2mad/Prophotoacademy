'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { applyProgress } from '@/lib/learning/progress';
import type { LessonProgress, ProgressReply, ProgressSample } from '@/lib/learning/types';
import type { LessonPlayerProps, ProgressQueue } from './types';
export function useLessonPlayer({ view, userId, demo }: LessonPlayerProps) {
  const [progress, setProgress] = useState(view.progress),
    [status, setStatus] = useState('Збережено'),
    [collapsed, setCollapsed] = useState(false),
    [error, setError] = useState('');
  const drawer = useRef<HTMLDialogElement>(null),
    queue = useRef<ProgressQueue>({ sessionId: '', sequence: 0, events: [] }),
    busy = useRef(false),
    current = useRef(progress),
    mounted = useRef(true);
  current.current = progress;
  const key = `prophoto-${demo ? 'demo' : 'progress'}:${userId}:${view.enrollment.course.id}:${view.lesson.id}`;
  const persist = useCallback(() => {
    try {
      localStorage.setItem(key, JSON.stringify(demo ? current.current : queue.current));
    } catch {}
  }, [key, demo]);
  const send = useCallback(async () => {
    if (busy.current || demo || !queue.current.events.length) return;
    busy.current = true;
    setStatus('Зберігаємо…');
    try {
      while (queue.current.events.length) {
        const event = queue.current.events[0];
        const response = await fetch(
          `/api/learning/${view.enrollment.course.id}/${view.lesson.id}/progress`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
            keepalive: true,
          },
        );
        const data = (await response.json()) as ProgressReply;
        if (!response.ok) {
          if ([401, 403].includes(response.status))
            setError('Доступ змінився. Увійдіть знову або зверніться до академії');
          throw new Error(data.error || 'Не вдалося зберегти');
        }
        queue.current.events.shift();
        persist();
        if (mounted.current) {
          current.current = data.state;
          setProgress(data.state);
        }
      }
      if (mounted.current) setStatus('Збережено');
    } catch {
      if (mounted.current) setStatus('Не збережено · повторюємо з’єднання');
    } finally {
      busy.current = false;
    }
  }, [demo, persist, view.enrollment.course.id, view.lesson.id]);
  const onProgress = useCallback(
    (sample: ProgressSample) => {
      if (!queue.current.sessionId) queue.current.sessionId = crypto.randomUUID();
      const event = {
        ...sample,
        observedAt: new Date().toISOString(),
        id: crypto.randomUUID(),
        sessionId: queue.current.sessionId,
        sequence: ++queue.current.sequence,
      };
      if (demo) {
        current.current = applyProgress(view.lesson, current.current, event, sample.elapsed);
        setProgress(current.current);
        persist();
        setStatus('Збережено в цьому браузері');
      } else {
        queue.current.events.push(event);
        persist();
        void send();
      }
    },
    [demo, persist, send, view.lesson],
  );
  useEffect(() => {
    mounted.current = true;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      if (stored) {
        if (demo) {
          current.current = stored as LessonProgress;
          setProgress(current.current);
        } else if (stored.sessionId && Array.isArray(stored.events)) queue.current = stored;
      }
    } catch {}
    const first = view.lesson.blocks[0];
    if (first) onProgress({ blockId: first.id, revision: first.revision, elapsed: 0 });
    const retry = setInterval(() => void send(), 10000);
    const online = () => void send();
    window.addEventListener('online', online);
    return () => {
      mounted.current = false;
      clearInterval(retry);
      window.removeEventListener('online', online);
      persist();
    };
  }, [key, demo, onProgress, send, persist, view.lesson]);
  function contents() {
    if (innerWidth < 1024) drawer.current?.showModal();
    else setCollapsed((value) => !value);
  }
  function confirm() {
    const first = view.lesson.blocks[0];
    if (first)
      onProgress({ blockId: first.id, revision: first.revision, elapsed: 0, manual: true });
  }
  return { progress, status, error, drawer, collapsed, contents, onProgress, confirm };
}
