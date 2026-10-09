import { SiteShell } from '@/components/templates/SiteShell/SiteShell';
import type { LayoutProps } from '@/app/types';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
export const metadata: Metadata = {
  title: {
    default: 'Pro Photo Academy — створюйте кадри, які працюють',
    template: '%s · Pro Photo Academy',
  },
  description:
    'Курси фотографії, відео та створення контенту на телефон і камеру. Онлайн і в Києві.',
  openGraph: {
    siteName: 'Pro Photo Academy',
    images: [{ url: '/images/hero.webp', width: 1800, height: 1200 }],
  },
};
export default async function AcademyLayout({ children }: LayoutProps) {
  const content = await getContent();
  return (
    <SiteShell site="academy" settings={content.settings}>
      {children}
    </SiteShell>
  );
}
