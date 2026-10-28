export type NotificationJob = {
  id: string;
  kind: string;
  attempts: number;
  data: {
    mode?: string;
    status?: string;
    programTitle?: string;
    packageName?: string;
    productKind?: string;
    fulfillment?: unknown;
    id?: string;
    orderId?: string;
    amount?: number;
    listAmount?: number;
    promoCode?: string;
    discountPercent?: number;
    customer?: { email: string; name?: string };
    [key: string]: unknown;
  };
};
export type EmailDetail = { label: string; value: string };
// One branded layout serves app emails and Supabase auth templates (whose code is a placeholder).
export type EmailContent = {
  subject: string;
  preheader: string;
  heading: string;
  paragraphs: string[];
  code?: string;
  details?: EmailDetail[];
  action?: { label: string; href: string };
  note?: string;
};
export type RenderedEmail = { subject: string; html: string; text: string };
export type InvitationAudience = 'student' | 'admin';
export type InvitationStatus = {
  state: 'none' | 'pending' | 'sent' | 'retrying' | 'local' | 'canceled';
  requestedAt: string | null;
};
export type InvitationJobRow = NotificationJob & { state: string };
export type InvitationInput = {
  email: string;
  audience: InvitationAudience;
  grantId?: string;
  programTitle?: string;
  packageName?: string;
  invitationCreatedAt?: string;
};
