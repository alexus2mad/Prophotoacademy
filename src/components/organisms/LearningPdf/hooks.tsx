'use client';
import { useEffect, useRef, useState } from 'react';
import { pdfLibrary } from '@/lib/learning/browser';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { LearningPdfProps } from './types';
export function useLearningPdf({ url }: LearningPdfProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null),
    [page, setPage] = useState(0),
    [scale, setScale] = useState(1),
    [error, setError] = useState(''),
    [text, setText] = useState(''),
    [ready, setReady] = useState(false),
    [containerWidth, setContainerWidth] = useState(760);
  const canvas = useRef<HTMLCanvasElement>(null),
    container = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setContainerWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let canceled = false,
      document: PDFDocumentProxy | undefined;
    setError('');
    setPdf(null);
    void pdfLibrary()
      .then(async (lib) => {
        document = await lib.getDocument({ url }).promise;
        if (canceled) await document.loadingTask.destroy();
        else setPdf(document);
      })
      .catch(() => {
        if (!canceled) setError('Не вдалося відкрити PDF. Спробуйте оновити урок');
      });
    return () => {
      canceled = true;
      void document?.loadingTask.destroy();
    };
  }, [url]);
  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let canceled = false;
    setReady(false);
    let cancelRender: (() => void) | undefined;
    void (async () => {
      const sheet = await pdf.getPage(page + 1);
      const natural = sheet.getViewport({ scale: 1 });
      const width = Math.min(containerWidth, 1100);
      const viewport = sheet.getViewport({ scale: Math.max(0.3, width / natural.width) * scale });
      const el = canvas.current;
      if (!el || canceled) return;
      el.width = viewport.width * devicePixelRatio;
      el.height = viewport.height * devicePixelRatio;
      el.style.width = viewport.width + 'px';
      el.style.height = viewport.height + 'px';
      const task = sheet.render({
        canvas: el,
        viewport,
        transform: [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0],
      });
      cancelRender = () => task.cancel();
      await task.promise;
      const content = await sheet.getTextContent();
      if (!canceled) {
        setText(
          content.items
            .map((item) =>
              'str' in item ? item.str + ('hasEOL' in item && item.hasEOL ? '\n' : ' ') : '',
            )
            .join(''),
        );
        setReady(true);
      }
    })().catch((e) => {
      if (!canceled && e?.name !== 'RenderingCancelledException')
        setError('Не вдалося показати сторінку');
    });
    return () => {
      canceled = true;
      cancelRender?.();
    };
  }, [pdf, page, scale, containerWidth]);
  return {
    canvas,
    container,
    page,
    setPage,
    scale,
    setScale,
    count: pdf?.numPages || 0,
    text,
    error,
    ready,
  };
}
