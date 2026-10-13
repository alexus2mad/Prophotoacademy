'use client';
import { useEffect, useRef, useState } from 'react';
import { lessonChapters } from '@/lib/learning/presentation';
import type { Lesson } from '@/lib/learning/types';
import { currentChapterIndex } from './helpers';

// One viewport reader is shared by the desktop curriculum and mobile drawer.
// The range after each heading includes its images, up to the next chapter.
export function useCurrentChapter(lesson: Lesson) {
  const [currentId, setCurrentId] = useState<string>();
  useEffect(() => {
    const chapters = lessonChapters(lesson).flatMap((chapter) => {
      const element = document.getElementById('material-' + chapter.id);
      return element ? [{ id: chapter.id, element }] : [];
    });
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerBottom =
        document.querySelector('.lesson-header')?.getBoundingClientRect().bottom || 0;
      const readingLine = headerBottom + Math.min(160, (window.innerHeight - headerBottom) / 4);
      const atBottom =
        window.scrollY > 0 &&
        Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2;
      const index = currentChapterIndex(
        chapters.map(({ element }) => element.getBoundingClientRect().top),
        readingLine,
        atBottom,
      );
      setCurrentId(chapters[index]?.id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    const canvas = document.querySelector('.lesson-canvas');
    if (canvas) resize.observe(canvas);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [lesson]);
  return currentId;
}

export function useChapterReveal(currentChapterId?: string) {
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navigation.current;
    if (!nav) return;
    const reveal = () => {
      const link = nav.querySelector<HTMLElement>('[aria-current="location"]');
      const container = nav.closest<HTMLElement>('.lesson-sidebar, .lesson-drawer');
      if (
        !link ||
        !container ||
        !link.getClientRects().length ||
        nav.contains(document.activeElement)
      )
        return;
      const bounds = container.getBoundingClientRect(),
        item = link.getBoundingClientRect();
      // Scroll only the navigation panel; never move the lesson or keyboard focus.
      if (item.top < bounds.top + 12) container.scrollTop += item.top - bounds.top - 12;
      else if (item.bottom > bounds.bottom - 12)
        container.scrollTop += item.bottom - bounds.bottom + 12;
    };
    reveal();
    const resize = new ResizeObserver(reveal);
    resize.observe(nav);
    return () => resize.disconnect();
  }, [currentChapterId]);
  return navigation;
}
