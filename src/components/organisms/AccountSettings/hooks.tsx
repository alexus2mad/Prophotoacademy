'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AccountSettingsProps } from './types';
export function useAccountSettings({ member, demo }: AccountSettingsProps) {
  const [name, setName] = useState(member.name),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault();
    if (demo) {
      setMessage('Демонстрація: ім’я змінено лише в цій формі');
      return;
    }
    setBusy(true);
    try {
      const r = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await r.json();
      setMessage(r.ok ? 'Ім’я збережено' : data.error || 'Не вдалося зберегти');
    } catch {
      setMessage('Немає з’єднання. Спробуйте ще раз');
    } finally {
      setBusy(false);
    }
  }
  return { name, setName, busy, message, save };
}
