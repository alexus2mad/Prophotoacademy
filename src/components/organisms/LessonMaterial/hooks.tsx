'use client';
import { useEffect, useState } from 'react';
import { demoMedia } from '@/lib/learning/demo';
import { assetHref } from '@/lib/learning/selectors';
import type { MediaAccess } from '@/lib/learning/types';
import type { LessonMaterialProps } from './types';
export function useLessonMedia({ block, courseId, lessonId, demo, preview }: LessonMaterialProps) {
  const [media, setMedia] = useState<MediaAccess>({}),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!block.mediaId) return;
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
  }, [block.mediaId, courseId, lessonId, demo, preview, attempt]);
  return { media, retry: () => setAttempt((value) => value + 1) };
}
