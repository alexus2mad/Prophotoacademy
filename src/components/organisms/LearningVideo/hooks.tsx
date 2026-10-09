'use client';
import { useEffect, useRef, useState } from 'react';
import { readingActive } from '@/lib/learning/browser';
import { mergeRanges } from '@/lib/learning/progress';
import type { Interval } from '@/lib/learning/types';
import type { LearningVideoProps, LearningVideoElement, PlayerPreferences } from './types';
export function useLearningVideo({ block, state, onProgress, media }: LearningVideoProps) {
  const ref = useRef<LearningVideoElement | null>(null),
    callback = useRef(onProgress),
    initial = useRef(state?.position || 0);
  callback.current = onProgress;
  const [error, setError] = useState('');
  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    let lastTime = player.currentTime || 0,
      lastWall = performance.now(),
      elapsed = 0,
      ranges: Interval[] = [],
      seeking = false;
    const preferences = () => {
      try {
        localStorage.setItem(
          'prophoto-player',
          JSON.stringify({
            volume: player.volume,
            muted: player.muted,
            speed: player.playbackRate,
            captionLanguage: [...Array.from(player.textTracks || [])].find(
              (t) => t.mode === 'showing',
            )?.language,
          }),
        );
      } catch {}
    };
    const flush = () => {
      callback.current({
        blockId: block.id,
        revision: block.revision,
        elapsed: Math.min(elapsed, 30),
        ranges: mergeRanges(ranges),
        position: player.currentTime || 0,
      });
      elapsed = 0;
      ranges = [];
    };
    const metadata = () => {
      if (initial.current > 0 && initial.current < (player.duration || Infinity))
        player.currentTime = initial.current;
      try {
        const p = JSON.parse(
          localStorage.getItem('prophoto-player') || '{}',
        ) as Partial<PlayerPreferences>;
        player.volume = Math.min(1, Math.max(0, p.volume ?? 1));
        player.muted = !!p.muted;
        player.playbackRate = Math.min(2, Math.max(0.5, p.speed || 1));
        for (const track of Array.from(player.textTracks || []))
          track.mode = track.language === p.captionLanguage ? 'showing' : 'disabled';
      } catch {}
      lastTime = player.currentTime;
      lastWall = performance.now();
    };
    const sample = () => {
      const now = performance.now(),
        delta = (now - lastWall) / 1000,
        current = player.currentTime;
      const viewed = current - lastTime;
      if (
        !player.paused &&
        !seeking &&
        readingActive() &&
        delta > 0 &&
        delta < 4 &&
        viewed > 0 &&
        viewed <= delta * 2 + 0.3
      ) {
        ranges.push([lastTime, current]);
        elapsed += delta;
      }
      lastTime = current;
      lastWall = now;
      if (elapsed >= 10) flush();
    };
    const onSeeking = () => {
      seeking = true;
      flush();
    };
    const onSeeked = () => {
      seeking = false;
      lastTime = player.currentTime;
      lastWall = performance.now();
    };
    const fail = () =>
      setError('Відео не вдалося відтворити. Перевірте з’єднання та перезавантажте урок');
    player.addEventListener('loadedmetadata', metadata);
    player.addEventListener('seeking', onSeeking);
    player.addEventListener('seeked', onSeeked);
    player.addEventListener('pause', flush);
    player.addEventListener('ended', flush);
    player.addEventListener('volumechange', preferences);
    player.addEventListener('ratechange', preferences);
    player.addEventListener('error', fail);
    player.textTracks?.addEventListener('change', preferences);
    const timer = setInterval(sample, 500);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      clearInterval(timer);
      flush();
      player.removeEventListener('loadedmetadata', metadata);
      player.removeEventListener('seeking', onSeeking);
      player.removeEventListener('seeked', onSeeked);
      player.removeEventListener('pause', flush);
      player.removeEventListener('ended', flush);
      player.removeEventListener('volumechange', preferences);
      player.removeEventListener('ratechange', preferences);
      player.removeEventListener('error', fail);
      player.textTracks?.removeEventListener('change', preferences);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, [block.id, block.revision, media.url, media.playbackId]);
  return { ref, error };
}
