'use client';
import { Expand } from 'lucide-react';
import { LearningVideo } from '@/components/organisms/LearningVideo/LearningVideo';
import { LearningPdf } from '@/components/organisms/LearningPdf/LearningPdf';
import { YouTubeRecording } from '@/components/organisms/YouTubeRecording/YouTubeRecording';
import { LessonImageViewer } from '@/components/organisms/LessonImageViewer/LessonImageViewer';
import { youtubeVideoId } from '@/lib/learning/youtube';
import { useEditorMediaPreview } from './hooks';
import type { EditorMediaPreviewProps } from './types';

export function EditorMediaPreview(props: EditorMediaPreviewProps) {
  const h = useEditorMediaPreview(props);
  const preview = { ...props, lessonId: 'editor', preview: true, onProgress: () => {} };
  if (props.block.youtubeUrl)
    return (
      <div className="editor-media-preview">
        {youtubeVideoId(props.block.youtubeUrl) ? (
          <YouTubeRecording block={props.block} />
        ) : (
          <p className="admin-muted">Додайте коректне посилання YouTube, щоб побачити запис</p>
        )}
      </div>
    );
  if (!props.block.mediaId) return null;
  if (h.media.error || h.imageFailed)
    return (
      <div className="editor-media-empty">
        <p role="status">{h.media.error || 'Зображення не завантажилося'}</p>
        <button type="button" className="button button-secondary" onClick={h.reload}>
          Оновити перегляд
        </button>
      </div>
    );
  if (!h.media.url && !h.media.playbackId)
    return (
      <div className="editor-media-empty" role="status">
        Завантажуємо перегляд матеріалу…
      </div>
    );
  return (
    <div className="editor-media-preview">
      {props.block.kind === 'image' ? (
        <>
          <button
            type="button"
            className="editor-photo-preview"
            aria-label="Відкрити прикріплене зображення"
            aria-haspopup="dialog"
            onClick={h.open}
          >
            <img
              src={h.media.url}
              alt={props.block.alt || 'Прикріплене зображення'}
              onError={h.failImage}
            />
            <span>
              <Expand size={18} />
              Збільшити
            </span>
          </button>
          {h.expanded && (
            <LessonImageViewer
              {...preview}
              images={[props.block]}
              initialIndex={0}
              onClose={h.close}
            />
          )}
        </>
      ) : props.block.kind === 'video' ? (
        <LearningVideo {...preview} media={h.media} />
      ) : h.media.url ? (
        <LearningPdf {...preview} block={{ ...props.block, kind: 'pdf' }} url={h.media.url} />
      ) : null}
    </div>
  );
}
