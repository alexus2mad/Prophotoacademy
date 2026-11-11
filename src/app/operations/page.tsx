import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { socialMetadata } from '@/lib/social-images/metadata';
export const metadata: Metadata = {
  title: 'ProPhoto · команда',
  robots: { index: false, follow: false },
  ...socialMetadata('/admin'),
};
export default function Operations() {
  redirect('/admin/students');
}
