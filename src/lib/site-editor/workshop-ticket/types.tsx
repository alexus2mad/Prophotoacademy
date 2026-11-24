export type WorkshopTicketOption = {
  id: string;
  label: string;
  description?: string;
  includes: string[];
  amount: number;
  price: string;
  /** Former price, shown struck through; never charged. */
  previousPrice?: string;
  /** Checkout address; empty when the ticket is not on sale. */
  href: string;
};

export type WorkshopTicketPresentation = {
  href: string;
  amount: number;
  price: string;
  currency: string;
  /** Every ticket of the workshop, in catalog order. */
  options: WorkshopTicketOption[];
};

export type WorkshopTicketChoice = {
  path: string;
  id: string;
  label: string;
  presentation: WorkshopTicketPresentation;
};
