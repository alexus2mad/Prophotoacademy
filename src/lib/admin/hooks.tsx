'use client';
import { useState } from 'react';
import type { AdminReply } from './types';
export function useAdminMutation(demo = false) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function mutate<T>(url: string, value: unknown): Promise<T | undefined> {
    setError('');
    setMessage('');
    if (demo) {
      setMessage('Демонстрація: зміни не надіслані на сервер');
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });
      const data = (await r.json()) as AdminReply<T>;
      if (!r.ok) throw new Error(data.error || 'Дію не вдалося виконати');
      setMessage('Збережено');
      return data.result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Спробуйте ще раз');
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, message, mutate, setError, setMessage };
}
