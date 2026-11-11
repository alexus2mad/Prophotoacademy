import type { LayoutProps } from '@/app/types';
import { socialMetadata } from '@/lib/social-images/metadata';

export const metadata = { ...socialMetadata('/admin') };

export default function DemoAdminLayout({ children }: LayoutProps) {
  return children;
}
