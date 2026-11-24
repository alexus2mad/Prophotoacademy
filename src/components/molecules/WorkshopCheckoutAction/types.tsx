import type { ReactNode } from 'react';
import type {
  WorkshopTicketOption,
  WorkshopTicketPresentation,
} from '@/lib/site-editor/workshop-ticket/types';
export type WorkshopCheckoutActionProps = {
  ticket?: WorkshopTicketPresentation;
  /** A specific ticket of a workshop with several; defaults to the first ticket. */
  option?: WorkshopTicketOption;
  editing?: boolean;
  preview?: boolean;
  /** Custom button content, such as a price card; the default is «Записатися». */
  children?: ReactNode;
  className?: string;
  /** Accessible name when the content is not a plain label. */
  label?: string;
};
