'use client';
import { useEffect, useRef, useState } from 'react';
import { pdfLibrary, readingActive, mostVisibleReadingBlock } from '@/lib/learning/browser';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { LearningPdfProps } from './types';
export function useLearningPdf({ url, block, onProgress }: LearningPdfProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null),
    [page, setPage] = useState(0),
    [scale, setScale] = useState(1),
    [error, setError] = useState(''),
    [text, setText] = useState(''),
    [ready, setReady] = useState(false),
    [containerWidth, setContainerWidth] = useState(760);
  const canvas = useRef<HTMLCanvasElement>(null),
    container = useRef<HTMLElement>(null),
    callback = useRef(onProgress);
  callback.current = onProgress;
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
  useEffect(() => {
    if (!ready) return;
    let activeAt = Date.now(),
      last = Date.now(),
      elapsed = 0;
    const active = () => {
      activeAt = Date.now();
    };
    const flush = () => {
      if (elapsed) {
        callback.current({
          blockId: block.id,
          revision: block.revision,
          elapsed: Math.min(30, elapsed),
          page,
        });
        elapsed = 0;
      }
    };
    const timer = setInterval(() => {
      const now = Date.now(),
        delta = Math.min(2, (now - last) / 1000);
      const visible = mostVisibleReadingBlock();
      last = now;
      if (
        readingActive() &&
        now - activeAt < 90000 &&
        visible?.element === container.current &&
        visible.visible >= 80
      ) {
        elapsed += delta;
        if (elapsed >= 5) flush();
      }
    }, 1000);
    ['pointermove', 'keydown', 'scroll'].forEach((event) =>
      window.addEventListener(event, active, { passive: true }),
    );
    document.addEventListener('visibilitychange', flush);
    return () => {
      clearInterval(timer);
      flush();
      ['pointermove', 'keydown', 'scroll'].forEach((event) =>
        window.removeEventListener(event, active),
      );
      document.removeEventListener('visibilitychange', flush);
    };
  }, [ready, page, block.id, block.revision]);
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
