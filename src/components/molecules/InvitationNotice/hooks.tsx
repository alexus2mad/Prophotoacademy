'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { InvitationNoticeProps } from './types';

export function useInvitationNotice({ email, audience, invitation, demo }: InvitationNoticeProps) {
  const router = useRouter();
  const mutation = useAdminMutation(demo);
  const pending = invitation?.state === 'pending' || invitation?.state === 'retrying';
  useEffect(() => {
    if (demo || !pending) return;
    // Background delivery usually finishes shortly after the mutation response.
    // Stop automatically after three checks; the explicit refresh stays available.
    const timers = [2_000, 5_000, 10_000].map((delay) => setTimeout(() => router.refresh(), delay));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [demo, pending, invitation?.requestedAt, router]);
  async function send() {
    const result = await mutation.mutate('/api/admin/invitation', { email, audience });
    if (result === undefined) return;
    mutation.setMessage('Запрошення додано в чергу на відправлення');
    router.refresh();
  }
  return { ...mutation, send, refresh: () => router.refresh() };
}
