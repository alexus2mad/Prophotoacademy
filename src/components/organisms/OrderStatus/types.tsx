export type Status = {
  learningAccess?: boolean;
  status: 'pending' | 'approved' | 'declined' | 'canceled' | 'refunded';
  mode: 'mock' | 'wayforpay';
  retryUrl: string;
  programTitle: string;
  packageName: string;
};
export type OrderStatusProps = { token: string };
