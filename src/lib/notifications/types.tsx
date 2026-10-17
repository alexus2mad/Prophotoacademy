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
    customer?: { email: string };
    [key: string]: unknown;
  };
};
