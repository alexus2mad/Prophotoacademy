import type { LayoutProps } from '@/app/types';
import { socialMetadata } from '@/lib/social-images/metadata';
export const dynamic = 'force-dynamic';
export const metadata = {
  robots: { index: false, follow: false },
  ...socialMetadata('/account'),
};
export default function AccountLayout({ children }: LayoutProps) {
  return children;
}
