import type { InquiryContext } from '@/lib/inquiries/types';
import type { ReactNode } from 'react';
export type InquiryButtonProps = InquiryContext & { children?: ReactNode; className?: string };
