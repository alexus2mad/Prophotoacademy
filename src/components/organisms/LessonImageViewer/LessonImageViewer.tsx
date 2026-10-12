'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { IconButton } from '@/components/atoms/IconButton/IconButton';
import { LessonImageSlide } from '@/components/organisms/LessonImageSlide/LessonImageSlide';
import { useLessonImageViewer } from './hooks';
import type { LessonImageViewerProps } from './types';

export function LessonImageViewer(props: LessonImageViewerProps) {
  const { dialog, index, current, navigate } = useLessonImageViewer(props);
  return (
    <Dialog
      dialogRef={dialog}
      className="lesson-image-viewer"
      aria-label="Фотографії уроку"
      closeLabel="Закрити фото"
      onClose={() => {
        if (!dialog.current?.open) props.onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          navigate(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <header className="lesson-image-viewer-header">
        <p aria-live="polite" aria-atomic="true">
          Фото {index + 1} з {props.images.length}
        </p>
      </header>
      <LessonImageSlide
        key={current.id}
        block={current}
        courseId={props.courseId}
        lessonId={props.lessonId}
        state={props.progress?.blocks[current.id]}
        demo={props.demo}
        preview={props.preview}
        onProgress={props.onProgress}
        onNavigate={navigate}
      />
      <footer className="lesson-image-viewer-footer">
        <IconButton
          data-gallery-direction="-1"
          aria-label="Попереднє фото"
          disabled={props.images.length < 2}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} />
        </IconButton>
        <p tabIndex={0}>{current.caption || current.alt || current.title}</p>
        <IconButton
          data-gallery-direction="1"
          aria-label="Наступне фото"
          disabled={props.images.length < 2}
          onClick={() => navigate(1)}
        >
          <ChevronRight size={24} />
        </IconButton>
      </footer>
    </Dialog>
  );
}
