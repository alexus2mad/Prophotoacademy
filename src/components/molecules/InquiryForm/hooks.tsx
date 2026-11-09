'use client';

import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { getAcquisition } from '@/lib/attribution';
import type { InquirySubmissionOptions, InquirySubmissionState } from './types';

export function useInquirySubmission({ site = 'academy', context }: InquirySubmissionOptions) {
  const review = process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages';
  const [state, setState] = useState<InquirySubmissionState>('idle');
  const [error, setError] = useState('');
  const [localCapture, setLocalCapture] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const reset = useCallback(() => {
    setState('idle');
    setError('');
    setLocalCapture(false);
    setFieldErrors({});
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (review || state === 'sending') return;
    setState('sending');
    setError('');
    setFieldErrors({});
    const form = event.currentTarget;
    const data = new FormData(form);
    const topic = String(data.get('topic') || '').trim();
    const message = String(data.get('message') || '').trim();
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          contact: data.get('contact'),
          message: topic ? `${topic}${message ? `\n\n${message}` : ''}` : message,
          website: data.get('website'),
          consent: data.get('consent') === 'on',
          programId: context.programId,
          offeringId: context.offeringId,
          packageId: context.packageId,
          subject: context.subject,
          source: context.source,
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
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Спробуйте ще раз.');
      setState('error');
    }
  }
  return { review, state, error, localCapture, fieldErrors, submit, reset };
}
