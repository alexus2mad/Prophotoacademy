'use client';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import { useInquirySubmission } from '@/components/molecules/InquiryForm/hooks';
import type { InquiryContext } from '@/lib/inquiries/types';
import { useEffect, useState } from 'react';
import type { InquiryDialogProps } from './types';

export function useInquiryDialog({ site = 'academy' }: InquiryDialogProps) {
  const { dialog } = useDialog();
  const [context, setContext] = useState<InquiryContext>({});
  const submission = useInquirySubmission({ site, context });
  const { reset } = submission;
  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<InquiryContext>).detail;
      setContext({
        ...detail,
        subject:
          detail.subject ||
          (!detail.programId && !detail.practiceSessionId ? 'program-selection' : undefined),
      });
      reset();
      dialog.current?.showModal();
    };
    window.addEventListener('academy:inquiry', open);
    return () => window.removeEventListener('academy:inquiry', open);
  }, [dialog, reset]);
  return { ...submission, dialog, context };
}
