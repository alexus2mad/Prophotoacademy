import type { LayoutProps } from '@/app/types';
import { socialMetadata } from '@/lib/social-images/metadata';
export const dynamic = 'force-dynamic';
export const metadata = {
  robots: { index: false, follow: false },
  ...socialMetadata('/admin'),
};
export default function AdminLayout({ children }: LayoutProps) {
  return children;
}
