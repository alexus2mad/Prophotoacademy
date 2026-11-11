import type { LayoutProps } from '@/app/types';
import { socialMetadata } from '@/lib/social-images/metadata';
export const dynamic = 'force-dynamic';
export const metadata = {
  robots: { index: false, follow: false },
  ...socialMetadata('/learn'),
};
export default function LearningLayout({ children }: LayoutProps) {
  return children;
}
