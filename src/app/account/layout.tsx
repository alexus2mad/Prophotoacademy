import type { LayoutProps } from '@/app/types';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default function AccountLayout({ children }: LayoutProps) {
  return children;
}
