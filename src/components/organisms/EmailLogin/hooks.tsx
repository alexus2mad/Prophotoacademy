import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthReply } from '@/lib/auth/types';
export function useEmailLogin(next: string) {
  const [email, setEmail] = useState(''),
    [code, setCode] = useState(''),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [sentAt, setSentAt] = useState(0);
  async function send(action: 'send' | 'verify') {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/' + action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: action === 'verify' ? code : undefined, next }),
      });
      const data: AuthReply = await response.json();
      if (!response.ok) throw new Error(data.error || 'Спробуйте ще раз');
      if (data.redirect) window.location.assign(data.redirect);
      else {
        setSent(true);
        setSentAt(Date.now());
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Спробуйте ще раз');
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send(sent ? 'verify' : 'send');
  }
  function resend() {
    if (Date.now() - sentAt < 60_000) {
      setError('Наступний код можна надіслати через хвилину');
      return;
    }
    void send('send');
  }
  return { email, setEmail, code, setCode, sent, setSent, busy, error, submit, resend };
}
