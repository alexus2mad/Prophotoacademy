'use client';
import { useEffect, useRef, useState } from 'react';
import type {
  ImageLibraryResult,
  ImageSource,
  LibraryImage,
} from '@/lib/site-editor/image-library/types';
import { browseImages, uploadImage } from './requests';

const empty: ImageLibraryResult = { images: [], total: 0, next: null };
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : 'Не вдалося завантажити зображення.';

export function useSiteImageLibrary() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<ImageSource>('all');
  const [result, setResult] = useState(empty);
  const [selected, select] = useState<LibraryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const currentRequest = useRef<AbortController | null>(null);
  const uploadRequest = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
    return () => uploadRequest.current?.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    currentRequest.current = controller;
    setLoading(true);
    setMore(false);
    setResult(empty);
    setError('');
    const timer = setTimeout(
      () => {
        browseImages(query, source, 0, controller.signal)
          .then((data) => {
            if (!controller.signal.aborted) setResult(data);
          })
          .catch((e) => {
            if (!controller.signal.aborted) setError(errorText(e));
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query ? 180 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, source, version]);

  async function loadMore() {
    const controller = currentRequest.current;
    if (!controller || more || loading || result.next === null) return;
    setMore(true);
    setError('');
    try {
      const next = await browseImages(query, source, result.next, controller.signal);
      if (!controller.signal.aborted)
        setResult((old) => ({
          ...next,
          images: [
            ...new Map([...old.images, ...next.images].map((item) => [item.url, item])).values(),
          ],
        }));
    } catch (e) {
      if (!controller.signal.aborted) setError(errorText(e));
    } finally {
      if (!controller.signal.aborted) setMore(false);
    }
  }
  async function upload(file?: File) {
    if (!file || uploading) return;
    const controller = new AbortController();
    uploadRequest.current = controller;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, controller.signal);
      if (!controller.signal.aborted) {
        select({ url, name: file.name, context: 'Завантаження' });
        setSource('uploads');
        setQuery('');
        setVersion((v) => v + 1);
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(errorText(e));
    } finally {
      if (!controller.signal.aborted) setUploading(false);
      if (input.current) input.current.value = '';
    }
  }
  return {
    dialog,
    input,
    query,
    setQuery,
    source,
    setSource,
    result,
    selected,
    select,
    loading,
    more,
    uploading,
    error,
    loadMore,
    upload,
    retry: () => setVersion((v) => v + 1),
  };
}
