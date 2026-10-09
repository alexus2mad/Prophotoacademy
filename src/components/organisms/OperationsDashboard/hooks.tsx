'use client';
import { useState } from 'react';
import type { Overview } from './types';

export function useOperationsDashboard() {
  const [data, setData] = useState<Overview>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget;
    const token = new FormData(form).get('token');
    try {
      const response = await fetch('/api/operations/customers', {
        headers: { Authorization: 'Bearer ' + token },
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не вдалося завантажити дані.');
    } finally {
      setBusy(false);
    }
  }
  return { data, setData, error, busy, load };
}
