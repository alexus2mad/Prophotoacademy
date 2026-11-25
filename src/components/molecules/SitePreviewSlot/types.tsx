import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';
import type { BlockPosition, SiteSection } from '@/lib/site-editor/types';

export type SitePreviewSlotProps = {
  slot: string;
  ticket?: WorkshopTicketPresentation;
  ticketAnnounced?: boolean;
  ticketOfferId?: string;
  label: string;
  blocks: SiteSection[];
  editable: boolean;
  selected: string;
  onInsert: (position: BlockPosition, label: string) => void;
  onChooseMove: (id: string) => void;
};
