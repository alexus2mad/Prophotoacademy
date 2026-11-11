import type { LayoutProps } from '@/app/types';
import { socialMetadata } from '@/lib/social-images/metadata';

export const metadata = { ...socialMetadata('/learn') };

export default function DemoLearningLayout({ children }: LayoutProps) {
  return children;
}
