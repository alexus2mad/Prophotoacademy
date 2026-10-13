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
    if (nearby || !container.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearby(true);
          observer.disconnect();
        }
      },
      { rootMargin: '2000px 0px' },
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [nearby]);
  return { ...useLessonMedia(props, nearby), container };
}
