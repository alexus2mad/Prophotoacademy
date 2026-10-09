'use client';
import MuxPlayer from '@mux/mux-player-react';
import { useLearningVideo } from './hooks';
import type { LearningVideoProps } from './types';
export function LearningVideo(props: LearningVideoProps) {
  const { block, media, demo } = props;
  const { ref, error } = useLearningVideo(props);
  return (
    <section className="lesson-block lesson-video" aria-label={block.title}>
      {block.title && <h2>{block.title}</h2>}
      {media.playbackId ? (
        <MuxPlayer
          ref={(element) => {
            ref.current = element;
          }}
          playbackId={media.playbackId}
          tokens={{ playback: media.token, thumbnail: media.thumbnailToken }}
          accentColor="#d5e4b9"
          streamType="on-demand"
          autoPlay={false}
          metadata={{ video_title: block.title }}
          playbackRates={[0.5, 0.75, 1, 1.25, 1.5, 2]}
        />
      ) : media.url ? (
        <video
          ref={(element) => {
            ref.current = element;
          }}
          controls
          playsInline
          preload="metadata"
          src={media.url}
          aria-label={block.title}
        />
      ) : (
        <p className="pdf-loading">Завантаження відео…</p>
      )}
      {error && (
        <p className="learning-error" role="alert">
          {error}
        </p>
      )}
      {demo && (
        <p className="learning-status">
          Приклад роботи плеєра · тестове відео Mux, не матеріал курсу
        </p>
      )}
    </section>
  );
}
