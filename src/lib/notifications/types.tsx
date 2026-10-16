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
    customer?: { email: string };
    [key: string]: unknown;
  };
};
