export type NotificationJob = {
  id: string;
  kind: string;
  attempts: number;
  data: {
    mode?: string;
    status?: string;
    programTitle?: string;
    customer?: { email: string };
    [key: string]: unknown;
  };
};
