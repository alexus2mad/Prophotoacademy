'use client';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import { getAcquisition } from '@/lib/attribution';
import type { InquiryContext } from '@/lib/inquiries/types';
import { useEffect, useState } from 'react';
import type { InquiryDialogProps, InquiryState } from './types';

export function useInquiryDialog({ site = 'academy' }: InquiryDialogProps) {
  const review = process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages';
  const { dialog } = useDialog();
  const [context, setContext] = useState<InquiryContext>({});
  const [state, setState] = useState<InquiryState>('idle');
  const [error, setError] = useState('');
  const [localCapture, setLocalCapture] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const open = (event: Event) => {
      setContext((event as CustomEvent<InquiryContext>).detail);
      setState('idle');
      setError('');
      setFieldErrors({});
      dialog.current?.showModal();
    };
    window.addEventListener('academy:inquiry', open);
    return () => window.removeEventListener('academy:inquiry', open);
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    if (review) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    setState('sending');
    setError('');
    setFieldErrors({});
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          contact: data.get('contact'),
          message: data.get('message'),
          website: data.get('website'),
          consent: data.get('consent') === 'on',
          programId: context.programId,
          offeringId: context.offeringId,
          packageId: context.packageId,
          acquisition: getAcquisition(site),
          marketingUpdates: data.get('marketingUpdates') === 'on',
          practiceSessionId: context.practiceSessionId,
          site,
          locality: context.practiceSessionId ? 'kyiv' : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const fields = result.fieldErrors || {};
        setFieldErrors(fields);
        const name = Object.keys(fields)[0];
        if (name) (form.elements.namedItem(name) as HTMLElement | null)?.focus();
        throw new Error(result.error || 'Не вдалося надіслати заявку.');
      }
      setLocalCapture(result.mode === 'local');
      setState('success');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Спробуйте ще раз.');
      setState('error');
    }
  }
  return { review, dialog, context, state, error, localCapture, fieldErrors, submit };
}
