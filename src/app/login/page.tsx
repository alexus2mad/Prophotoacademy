import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EmailLogin } from '@/components/organisms/EmailLogin/EmailLogin';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { authConfigured, currentMember } from '@/lib/auth/server';
import { safeReturnTo } from '@/lib/auth/identity';
import { academyThemeClassName } from '@/lib/typography/fonts';
import type { AccountPageProps } from '@/app/types';
export const metadata = { title: 'Вхід · ProPhoto', robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: AccountPageProps) {
  const query = await searchParams;
  const next = safeReturnTo(query.next);
  if (query.reauth !== '1' && (await currentMember())) redirect(next);
  return (
    <main id="main" className={`learning-app login-page ${academyThemeClassName}`}>
      <Link href="/" className="brand-link" aria-label="ProPhoto — головна">
        <BrandLogo />
      </Link>
      <EmailLogin next={next} configured={authConfigured()} />
    </main>
  );
}
