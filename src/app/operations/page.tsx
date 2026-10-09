import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { managementUrl } from '@/lib/commerce/cashbox';
export const metadata: Metadata = {
  title: 'ProPhoto · команда',
  robots: { index: false, follow: false },
};
export default function Operations() {
  redirect(managementUrl());
}
