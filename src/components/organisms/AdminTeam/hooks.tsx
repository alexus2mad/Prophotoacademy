'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { FormEvent } from 'react';
import type { AdminTeamProps, TeamChange } from './types';

const reverifyMessage = 'Підтвердьте email ще раз для цієї дії';

export function useAdminTeam({ demo }: AdminTeamProps) {
  const router = useRouter();
  const h = useAdminMutation(demo);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [change, setChange] = useState<TeamChange>({ email: '', grant: true, reason: '' });
  const update = (patch: Partial<TeamChange>) => setChange((c) => ({ ...c, ...patch }));
  // Review first; the change is sent only from the confirmation dialog.
  function review(event: FormEvent) {
    event.preventDefault();
    h.setError('');
    h.setMessage('');
    dialogRef.current?.showModal();
  }
  async function confirm() {
    const saved = await h.mutate('/api/admin/team', {
      ...change,
      email: change.email.trim().toLowerCase(),
    });
    dialogRef.current?.close();
    if (saved === undefined) return;
    setChange({ email: '', grant: true, reason: '' });
    router.refresh();
  }
  return {
    ...h,
    dialogRef,
    change,
    update,
    review,
    confirm,
    needsVerification: h.error === reverifyMessage,
  };
}
