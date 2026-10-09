import { SiteShell } from '@/components/templates/SiteShell/SiteShell';
import type { LayoutProps } from '@/app/types';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { canonicalUrl } from '@/lib/ecosystem';
export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl('hub')),
  title: { default: 'ProPhoto Hub — фотостудія в Києві', template: '%s · ProPhoto Hub' },
  description:
    'Циклорама, подкаст-зала та гримерна в центрі Києва. Тарифи, фотографії залів і онлайн-бронювання.',
  openGraph: {
    siteName: 'ProPhoto Hub',
    images: [
      {
        url: new URL('/images/hub-cyclorama.webp', canonicalUrl('hub')).href,
        width: 1800,
        height: 1200,
      },
    ],
  },
};
export default async function HubLayout({ children }: LayoutProps) {
  const content = await getContent();
  return (
    <SiteShell site="hub" settings={content.hub}>
      {children}
    </SiteShell>
  );
}
