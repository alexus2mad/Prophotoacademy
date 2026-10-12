'use client';
import { useState } from 'react';
import { useLessonMedia } from '@/components/organisms/LessonMaterial/hooks';
import { useReadingMaterial } from '@/components/organisms/ReadingMaterial/hooks';
import type { LessonImageSlideProps } from './types';

export function useLessonImageSlide(props: LessonImageSlideProps) {
  const { media, retry } = useLessonMedia(props);
  const [failed, setFailed] = useState(false);
  const reading = useReadingMaterial({ ...props, url: media.url });
  return {
    media,
    reading,
    failed,
    fail: () => setFailed(true),
    retry: () => {
      setFailed(false);
      retry();
    },
  };
}
