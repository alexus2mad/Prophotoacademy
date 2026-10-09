import type { InquiryContext } from './types';

export function openInquiry(context: InquiryContext) {
  window.dispatchEvent(new CustomEvent<InquiryContext>('academy:inquiry', { detail: context }));
}
