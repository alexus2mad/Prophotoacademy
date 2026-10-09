'use client';
import { useRef, useState } from 'react';
import { useAdminMutation } from '@/lib/admin/hooks';
import { pdfLibrary } from '@/lib/learning/browser';
import type { LessonBlockEditorProps, UploadSessionReply, UploadStatusReply } from './types';
export function useLessonBlockEditor({ block, courseId, demo, onChange }: LessonBlockEditorProps) {
  const h = useAdminMutation(demo),
    [uploading, setUploading] = useState(false),
    [uploadMessage, setUploadMessage] = useState(''),
    text = useRef<HTMLTextAreaElement>(null),
    lastFile = useRef<File | null>(null);
  function markdown(prefix: string, suffix = '') {
    const area = text.current;
    if (!area) return;
    const value = block.body || '',
      start = area.selectionStart,
      end = area.selectionEnd;
    onChange({
      body: value.slice(0, start) + prefix + value.slice(start, end) + suffix + value.slice(end),
    });
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  }
  async function upload(file: File) {
    lastFile.current = file;
    if (demo) {
      setUploadMessage(
        'У демонстрації файли не надсилаються. У робочій версії матеріал завантажиться у захищене сховище',
      );
      return;
    }
    setUploading(true);
    setUploadMessage('Підготовка завантаження…');
    try {
      const pdf = file.type === 'application/pdf';
      if (block.kind !== 'video' && file.size > 52428800)
        throw new Error('Максимальний розмір файла — 50 МБ');
      const session = await h.mutate<UploadSessionReply>('/api/admin/uploads', {
        courseId,
        kind: block.kind === 'file' ? 'pdf' : block.kind,
        title: file.name,
        mime: file.type,
      });
      if (!session) return;
      setUploadMessage('Завантажуємо файл…');
      const response = await fetch(session.url, {
        method: session.method,
        headers: session.headers,
        body: file,
      });
      if (!response.ok) throw new Error('Завантаження перервалося');
      let pageSeconds: number[] | undefined;
      if (pdf) {
        const lib = await pdfLibrary();
        const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
          .promise;
        try {
          pageSeconds = [];
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i),
              text = await page.getTextContent();
            const words = text.items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ')
              .trim()
              .split(/\s+/)
              .filter(Boolean).length;
            pageSeconds.push(words ? Math.max(5, Math.ceil((words * 60) / 200)) : 10);
          }
        } finally {
          await doc.loadingTask.destroy();
        }
      }
      onChange({ mediaId: session.id, ...(pageSeconds ? { pageSeconds } : {}) });
      setUploadMessage('Обробляємо матеріал…');
      const result = await h.mutate<UploadStatusReply>('/api/admin/upload-complete', {
        id: session.id,
        pageSeconds,
      });
      if (result?.status === 'ready') {
        setUploadMessage('Матеріал готовий');
        if (result.duration) onChange({ mediaId: session.id, duration: Number(result.duration) });
      } else setUploadMessage('Відео обробляється. Перевірте готовність перед публікацією');
    } catch (e) {
      setUploadMessage(e instanceof Error ? e.message : 'Помилка завантаження');
    } finally {
      setUploading(false);
    }
  }
  async function check() {
    if (block.mediaId) {
      const result = await h.mutate<UploadStatusReply>('/api/admin/upload-complete', {
        id: block.mediaId,
        pageSeconds: block.pageSeconds,
      });
      setUploadMessage(result?.status === 'ready' ? 'Матеріал готовий' : 'Обробка триває');
      if (result?.duration) onChange({ duration: Number(result.duration) });
    }
  }
  return {
    ...h,
    uploading,
    uploadMessage,
    upload,
    check,
    text,
    markdown,
    retry: () => lastFile.current && upload(lastFile.current),
  };
}
