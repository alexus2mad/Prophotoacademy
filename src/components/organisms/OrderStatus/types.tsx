export type Status = {
  learningAccess?: boolean;
  status: OrderStatus;
  mode: PaymentMode;
  retryUrl: string;
  programTitle: string;
  packageName: string;
};
export type OrderStatusProps = { token: string };
import type { PaymentMode } from '@/lib/commerce/types';
import type { OrderStatus } from '@/lib/ledger/types';
