import { SiteShell } from '@/components/templates/SiteShell/SiteShell';
import type { LayoutProps } from '@/app/types';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { canonicalUrl } from '@/lib/ecosystem';
import { socialMetadata } from '@/lib/social-images/metadata';
export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl('hub')),
  title: { default: 'ProPhoto Hub — фотостудія в Києві', template: '%s · ProPhoto Hub' },
  description:
    'Циклорама, подкаст-зала та гримерна в центрі Києва. Тарифи, фотографії залів і онлайн-бронювання.',
  ...socialMetadata('/hub', { path: canonicalUrl('hub') }),
};
export default async function HubLayout({ children }: LayoutProps) {
  const content = await getContent();
  return (
    <SiteShell site="hub" settings={content.hub}>
      {children}
    </SiteShell>
  );
}
