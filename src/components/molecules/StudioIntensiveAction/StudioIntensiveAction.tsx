import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import type { StudioIntensiveActionProps } from './types';

export function StudioIntensiveAction({ inquiry, purchaseAvailable }: StudioIntensiveActionProps) {
  return purchaseAvailable ? (
    <a href="#intensive-offers" className="studio-button">
      Обрати формат →
    </a>
  ) : (
    <InquiryButton {...inquiry} className="studio-button">
      Залишити заявку →
    </InquiryButton>
  );
}
