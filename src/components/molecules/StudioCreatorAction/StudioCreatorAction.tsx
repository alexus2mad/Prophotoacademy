import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import type { StudioCreatorActionProps } from './types';

export function StudioCreatorAction({
  program,
  offering,
  presentation,
  label = 'Хочу на курс',
}: StudioCreatorActionProps) {
  if (presentation.open && offering?.packages.length) {
    return (
      <a className="studio-button" href="#packages">
        {label}
        <span aria-hidden="true">→</span>
      </a>
    );
  }
  return (
    <InquiryButton
      className="studio-button"
      programId={program.id}
      offeringId={offering?.id}
      title={presentation.inquiryTitle}
    >
      {presentation.buttonLabel}
      <span aria-hidden="true">→</span>
    </InquiryButton>
  );
}
