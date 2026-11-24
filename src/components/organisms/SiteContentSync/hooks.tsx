'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SyncOverview } from '@/lib/site-editor/sync/types';
import { fetchSyncOverview, publishFromStaging, SyncRequestError } from './requests';
import type { SiteContentSyncProps, SyncTask } from './types';

export function useSiteContentSync({ focusPath, onPublished }: SiteContentSyncProps) {
  const [overview, setOverview] = useState<SyncOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [task, setTask] = useState<SyncTask>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async (focus?: string) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    try {
      const result = await fetchSyncOverview(current.signal);
      if (current.signal.aborted) return;
      setOverview(result);
      const handed = focus && result.candidates.find((c) => c.path === focus && !c.problem);
      if (handed) setTask({ path: handed.path, kind: 'confirm' });
      else if (focus && !result.candidates.some((c) => c.path === focus))
        setMessage('Сторінка ' + focus + ' на проді вже така сама, як на staging');
    } catch (e) {
      if (!current.signal.aborted)
        setError(e instanceof Error ? e.message : 'Не вдалося завантажити зміни зі staging');
    } finally {
      if (!current.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    heading.current?.focus();
    void load(focusPath);
    return () => controller.current?.abort();
  }, [focusPath, load]);

  async function publish(path: string) {
    const candidate = overview?.candidates.find((c) => c.path === path);
    if (!candidate || task?.kind === 'publish') return;
    setTask({ path, kind: 'publish' });
    setError('');
    setMessage('');
    try {
      const result = await publishFromStaging(candidate);
      setMessage('«' + result.page.title + '» опубліковано на проді');
      onPublished(result);
      setTask(null);
      await load();
    } catch (e) {
      setTask(null);
      setError(e instanceof Error ? e.message : 'Не вдалося опублікувати сторінку');
      if (e instanceof SyncRequestError && e.status === 409) await load();
    }
  }

  return {
    overview,
    loading,
    error,
    message,
    task,
    heading,
    confirm: (path: string) => {
      setError('');
      setTask({ path, kind: 'confirm' });
    },
    cancel: () => setTask(null),
    publish,
    reload: () => load(),
  };
}
