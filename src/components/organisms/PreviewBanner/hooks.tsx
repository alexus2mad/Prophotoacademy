'use client';
import { useState } from 'react';

export function usePreviewBanner() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function exit() {
    setBusy(true);
    try {
      const response = await fetch('/api/draft/disable', { method: 'POST' });
      if (!response.ok) throw new Error();
      window.location.reload();
    } catch {
      setError(true);
      setBusy(false);
    }
  }
  return { busy, error, exit };
}
