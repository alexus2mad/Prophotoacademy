'use client';
import { useEffect, useRef, useState } from 'react';
import { demoMedia } from '@/lib/learning/demo';
import { assetHref } from '@/lib/learning/selectors';
import type { MediaAccess, LessonBlockProps } from '@/lib/learning/types';
export function useLessonMedia(
  { block, courseId, lessonId, demo, preview }: LessonBlockProps,
  enabled = true,
) {
  const [media, setMedia] = useState<MediaAccess>({}),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled || !block.mediaId || (block.kind === 'file' && !demo)) return;
    const controller = new AbortController();
    setMedia({});
    if (demo) {
      setMedia({ url: assetHref(demoMedia[block.mediaId] || '') });
      return;
    }
    void fetch(
      preview
        ? `/api/admin/courses/${courseId}/media/${block.mediaId}`
        : `/api/learning/${courseId}/${lessonId}/media/${block.mediaId}`,
      {
        signal: controller.signal,
        cache: 'no-store',
      },
    )
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Не вдалося відкрити матеріал');
        return data;
      })
      .then(setMedia)
      .catch((e) => {
        if (!controller.signal.aborted) setMedia({ error: e.message });
      });
    return () => controller.abort();
  }, [block.mediaId, block.kind, courseId, lessonId, demo, preview, attempt, enabled]);
  return { media, retry: () => setAttempt((value) => value + 1) };
}

export function useLessonMaterial(props: LessonBlockProps) {
  const container = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(props.block.kind !== 'image');
  useEffect(() => {
    const element = container.current;
    if (nearby || !element) return;
    if (!('IntersectionObserver' in window)) {
      setNearby(true);
      return;
    }
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      frame = 0;
      observer?.disconnect();
      observer = undefined;
      window.removeEventListener('resize', schedule);
    };
    const observe = () => {
      frame = 0;
      if (stopped) return;
      observer?.disconnect();
      // Pixel margins follow viewport height; percentage observer margins use width.
      const distance = Math.ceil(window.innerHeight * 3);
      const current = new IntersectionObserver(
        ([entry]) => {
          if (stopped || observer !== current || !entry?.isIntersecting) return;
          stop();
          setNearby(true);
        },
        { rootMargin: `${distance}px 0px` },
      );
      observer = current;
      current.observe(element);
    };
    const schedule = () => {
      if (!stopped && !frame) frame = requestAnimationFrame(observe);
    };
    window.addEventListener('resize', schedule, { passive: true });
    observe();
    return stop;
  }, [nearby]);
  return { ...useLessonMedia(props, nearby), container };
}
