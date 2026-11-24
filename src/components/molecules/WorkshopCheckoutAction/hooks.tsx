'use client';
import { useEffect, useState } from 'react';
import { startWorkshopCheckout } from './request';

export function useWorkshopCheckout(href?: string) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const restored = () => setSending(false);
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, []);
  async function submit() {
    if (!href || sending) return;
    setError('');
    setSending(true);
    try {
      window.location.assign(await startWorkshopCheckout(href));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Не вдалося відкрити оплату. Спробуйте ще раз.',
      );
      setSending(false);
    }
  }
  return { sending, error, submit };
}
