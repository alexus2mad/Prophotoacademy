'use client';

import { useEffect, useState } from 'react';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import type { InquiryContext } from '@/lib/inquiries/types';

export function useStudioInquiryDrawer() {
  const { dialog } = useDialog();
  const [context, setContext] = useState<InquiryContext>({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    let previousOverflow: string | undefined;
    const restoreScroll = () => {
      if (previousOverflow !== undefined) document.body.style.overflow = previousOverflow;
      previousOverflow = undefined;
    };
    const open = (event: Event) => {
      setContext((event as CustomEvent<InquiryContext>).detail || {});
      setRevision((value) => value + 1);
      element?.showModal();
      if (previousOverflow === undefined) previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    };
    window.addEventListener('academy:inquiry', open);
    element?.addEventListener('close', restoreScroll);
    return () => {
      window.removeEventListener('academy:inquiry', open);
      element?.removeEventListener('close', restoreScroll);
      restoreScroll();
    };
  }, [dialog]);
  return { dialog, context, revision };
}
