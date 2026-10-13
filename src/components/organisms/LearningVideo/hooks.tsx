'use client';
import { useEffect, useRef, useState } from 'react';
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
    let lastSaved = initial.current;
    let lastSaveAt = 0;
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
      const position = player.currentTime || 0;
      if (position === lastSaved || player.readyState === 0) return;
      lastSaved = position;
      lastSaveAt = Date.now();
      callback.current({ kind: 'resume', blockId: block.id, revision: block.revision, position });
    };
    const bookmark = () => {
      if (Date.now() - lastSaveAt >= 15000) flush();
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
    };
    const fail = () =>
      setError('Відео не вдалося відтворити. Перевірте з’єднання та перезавантажте урок');
    player.addEventListener('loadedmetadata', metadata);
    player.addEventListener('timeupdate', bookmark);
    player.addEventListener('seeked', flush);
    player.addEventListener('pause', flush);
    player.addEventListener('ended', flush);
    player.addEventListener('volumechange', preferences);
    player.addEventListener('ratechange', preferences);
    player.addEventListener('error', fail);
    player.textTracks?.addEventListener('change', preferences);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      flush();
      player.removeEventListener('loadedmetadata', metadata);
      player.removeEventListener('timeupdate', bookmark);
      player.removeEventListener('seeked', flush);
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
