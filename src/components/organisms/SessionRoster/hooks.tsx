'use client';
import { useRef, useState } from 'react';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { RosterPerson } from '@/lib/admin/types';
import type { RosterReply, SessionRosterProps } from './types';

export function useSessionRoster({ sessionId, demo, demoPeople = [] }: SessionRosterProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const h = useAdminMutation(demo);
  const [people, setPeople] = useState<RosterPerson[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  async function load() {
    if (demo) return demoPeople;
    const response = await fetch('/api/admin/roster?sessionId=' + encodeURIComponent(sessionId), {
      cache: 'no-store',
    });
    const data = (await response.json()) as RosterReply;
    if (!response.ok) throw new Error(data.error || 'Не вдалося завантажити учасників');
    return data.people;
  }
  async function open() {
    h.setError('');
    h.setMessage('');
    setSelected([]);
    dialogRef.current?.showModal();
    setLoading(true);
    try {
      setPeople(await load());
    } catch (error) {
      h.setError(error instanceof Error ? error.message : 'Спробуйте ще раз');
    } finally {
      setLoading(false);
    }
  }
  function toggle(id: string, checked: boolean) {
    setSelected((current) => (checked ? [...current, id] : current.filter((x) => x !== id)));
  }
  async function record(attended: boolean) {
    const saved = await h.mutate('/api/admin/attendance', {
      sessionId,
      userIds: selected,
      attended,
    });
    if (saved === undefined) return;
    h.setMessage('Відвідування збережено');
    setPeople((current) => current.map((p) => (selected.includes(p.id) ? { ...p, attended } : p)));
    setSelected([]);
  }
  return { ...h, dialogRef, people, selected, loading, open, toggle, record };
}
