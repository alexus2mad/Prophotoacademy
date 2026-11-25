import type { CheckoutPageProps } from '@/app/types';
import { CheckoutRoute } from '../../checkout/CheckoutRoute';

export const dynamic = 'force-dynamic';

export default function CheckoutOverlay(props: CheckoutPageProps) {
  return <CheckoutRoute {...props} intercepted />;
}
