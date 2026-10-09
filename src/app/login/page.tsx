import Link from 'next/link';
import { EmailLogin } from '@/components/organisms/EmailLogin/EmailLogin';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { authConfigured } from '@/lib/auth/server';
import { safeReturnTo } from '@/lib/auth/identity';
import type { AccountPageProps } from '@/app/types';
export const metadata = { title: 'Вхід · ProPhoto', robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: AccountPageProps) {
  const query = await searchParams;
  return (
    <main id="main" className="learning-app login-page">
      <Link href="/" className="brand-link" aria-label="ProPhoto — головна">
        <BrandLogo />
      </Link>
      <EmailLogin next={safeReturnTo(query.next)} configured={authConfigured()} />
    </main>
  );
}
