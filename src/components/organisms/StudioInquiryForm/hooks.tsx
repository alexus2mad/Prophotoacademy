'use client';

import { useId, useState } from 'react';
import { useInquirySubmission } from '@/components/molecules/InquiryForm/hooks';
import type { StudioInquiryFormProps } from './types';

const topics = [
  { label: 'Консультація', subject: 'program-selection' },
  { label: 'Воркшопи', subject: 'workshops' },
  { label: 'Індивідуальне навчання', subject: 'individual-training' },
  { label: 'Корпоративне навчання', subject: 'corporate-training' },
  { label: 'ProPhoto Кемп', subject: 'camp' },
] as const;

export function useStudioInquiryForm({ context = {}, id, topic }: StudioInquiryFormProps) {
  const generatedId = useId();
  const [chosenTopic, setSelected] = useState('Консультація');
  const contextual = !!(context.programId || context.practiceSessionId || context.title || topic);
  const selected = contextual ? topic || context.title || 'Консультація' : chosenTopic;
  const choices = contextual
    ? [topic || context.title || 'Консультація']
    : topics.map((item) => item.label);
  const submission = useInquirySubmission({
    context: {
      ...context,
      source: context.source || 'consultation',
      subject: contextual
        ? context.subject
        : topics.find((item) => item.label === selected)?.subject,
    },
  });
  return { ...submission, formId: id || generatedId, selected, setSelected, choices };
}
