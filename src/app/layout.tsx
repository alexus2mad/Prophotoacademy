import type { LayoutProps } from '@/app/types';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { draftMode } from 'next/headers';
import { PreviewBanner } from '@/components/organisms/PreviewBanner/PreviewBanner';
import { PhotographyMotion } from '@/components/behaviors/PhotographyMotion/PhotographyMotion';
import './design-system.css';
import './ecosystem.css';
const manrope = localFont({
  src: [
    { path: './fonts/manrope-0.woff2', weight: '400', style: 'normal' },
    { path: './fonts/manrope-1.woff2', weight: '500', style: 'normal' },
    { path: './fonts/manrope-2.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-manrope',
  display: 'swap',
});
const kyiv = localFont({
  src: [
    { path: './fonts/kyivtype-regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/kyivtype-medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'),
  title: 'ProPhoto',
  openGraph: { type: 'website', locale: 'uk_UA' },
  twitter: { card: 'summary_large_image' },
};
export default async function RootLayout({ children }: LayoutProps) {
  const preview = (await draftMode()).isEnabled;
  return (
    <html
      lang="uk"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${kyiv.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Перейти до вмісту
        </a>
        {preview && <PreviewBanner />}
        {children}
        <PhotographyMotion />
      </body>
    </html>
  );
}
