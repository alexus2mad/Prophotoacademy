import type { CheckoutPageProps } from '@/app/types';
import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-images/metadata';
import { CheckoutRoute } from './CheckoutRoute';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Оформлення замовлення',
  robots: { index: false, follow: false },
  ...socialMetadata('/checkout'),
};

export default function CheckoutPage(props: CheckoutPageProps) {
  return <CheckoutRoute {...props} />;
}
