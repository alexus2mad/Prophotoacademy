'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { FormEvent } from 'react';
import type { PromoCode } from '@/lib/commerce/types';
import type { AdminPromoCodesProps, DeletedPromo, PromoDraft } from './types';

const empty: PromoDraft = {
  code: '',
  percent: '5',
  active: true,
  starts: '',
  expires: '',
  maxUses: '',
  programIds: [],
  note: '',
};
// Managers pick calendar days in their own time zone; a code ends after its last day.
const day = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const startOf = (date: string) => (date ? new Date(date + 'T00:00:00').toISOString() : null);
const endOf = (date: string) => (date ? new Date(date + 'T23:59:59.999').toISOString() : null);

export function useAdminPromoCodes({ demo }: AdminPromoCodesProps) {
  const router = useRouter();
  const h = useAdminMutation(demo);
  const [draft, setDraft] = useState<PromoDraft>(empty);
  const [editing, setEditing] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const update = (patch: Partial<PromoDraft>) => setDraft((d) => ({ ...d, ...patch }));
  function edit(code: PromoCode) {
    setConfirmingDelete(false);
    setEditing(code.code);
    setDraft({
      code: code.code,
      percent: String(code.percent),
      active: code.active,
      starts: day(code.startsAt),
      expires: day(code.expiresAt),
      maxUses: code.maxUses ? String(code.maxUses) : '',
      programIds: code.programIds,
      note: code.note,
    });
  }
  function reset() {
    setConfirmingDelete(false);
    setEditing('');
    setDraft(empty);
    h.setError('');
    h.setMessage('');
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    const saved = await h.mutate<PromoCode>('/api/admin/promo-codes', {
      code: draft.code,
      percent: Number(draft.percent),
      active: draft.active,
      startsAt: startOf(draft.starts),
      expiresAt: endOf(draft.expires),
      maxUses: draft.maxUses ? Number(draft.maxUses) : null,
      programIds: draft.programIds,
      note: draft.note,
      update: Boolean(editing),
    });
    if (!saved) return;
    setEditing(saved.code);
    router.refresh();
  }
  // Two clicks, no browser dialog: the first arms the button, the second deletes.
  async function remove() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    const deleted = await h.mutate<DeletedPromo>('/api/admin/promo-code-delete', {
      code: editing,
    });
    setConfirmingDelete(false);
    if (!deleted) return;
    setEditing('');
    setDraft(empty);
    h.setMessage(`Промокод ${deleted.code} видалено`);
    router.refresh();
  }
  return { ...h, draft, update, editing, edit, reset, save, remove, confirmingDelete };
}
