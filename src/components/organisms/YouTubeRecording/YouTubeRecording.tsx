import { youtubeVideoId } from '@/lib/learning/youtube';
import type { YouTubeRecordingProps } from './types';

export function YouTubeRecording({ block }: YouTubeRecordingProps) {
  const videoId = youtubeVideoId(block.youtubeUrl || '');
  if (!videoId) return null;
  return (
    <section className="lesson-block lesson-recording" aria-labelledby={'recording-' + block.id}>
      <h2 id={'recording-' + block.id}>{block.title || 'Запис лекції'}</h2>
      <div className="lesson-recording-player">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`}
          title={block.title || 'Запис лекції'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <a
        className="lesson-recording-link"
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Відкрити запис на YouTube
      </a>
    </section>
  );
}
