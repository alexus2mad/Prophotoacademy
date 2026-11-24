export type WorkshopTicketPresentation = {
  href: string;
  amount: number;
  price: string;
  currency: string;
};

export type WorkshopTicketChoice = {
  path: string;
  id: string;
  label: string;
  presentation: WorkshopTicketPresentation;
};
