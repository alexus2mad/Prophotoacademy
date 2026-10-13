'use client';
import { useState } from 'react';
import { useLessonMedia } from '@/components/organisms/LessonMaterial/hooks';
import type { LessonImageSlideProps } from './types';

export function useLessonImageSlide(props: LessonImageSlideProps) {
  const { media, retry } = useLessonMedia(props);
  const [failed, setFailed] = useState(false);
  return {
    media,
    failed,
    fail: () => setFailed(true),
    retry: () => {
      setFailed(false);
      retry();
    },
  };
}
