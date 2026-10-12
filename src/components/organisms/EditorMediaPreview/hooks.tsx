'use client';
import { useState } from 'react';
import { useLessonMedia } from '@/components/organisms/LessonMaterial/hooks';
import type { EditorMediaPreviewProps } from './types';

export function useEditorMediaPreview(props: EditorMediaPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const media = useLessonMedia({
    ...props,
    block: props.block.kind === 'file' ? { ...props.block, kind: 'pdf' } : props.block,
    lessonId: 'editor',
    preview: true,
    onProgress: () => {},
  });
  return {
    ...media,
    expanded,
    open: () => setExpanded(true),
    close: () => setExpanded(false),
    imageFailed,
    failImage: () => setImageFailed(true),
    reload: () => {
      setImageFailed(false);
      media.retry();
    },
  };
}
