'use client';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';

import Link from 'next/link';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { studioAssets } from '@/lib/studio-design/assets';
import { phoneLabel } from '@/lib/format';
import { ecosystemPages } from '@/lib/ecosystem';
import { useStudioFooter } from './hooks';
import type { StudioFooterProps } from './types';

export function StudioFooter({ settings }: StudioFooterProps) {
  const { focused, home } = useStudioFooter();
  const legalNavigation = (
    <nav className="studio-footer-legal" aria-label="Правова інформація">
      <Link href="/terms-of-service">Публічна оферта</Link>
      <Link href="/privacy-policy">Конфіденційність</Link>
    </nav>
  );
  const socials = [
    {
      href: settings.instagram,
      label: 'Instagram',
      asset: { src: '/brand/social/instagram.svg', width: 20, height: 20 },
    },
    {
      href: settings.telegram,
      label: 'Telegram',
      asset: { src: '/brand/social/telegram.svg', width: 17, height: 17 },
    },
    {
      href: settings.youtube,
      label: 'YouTube',
      asset: { src: '/brand/social/youtube.svg', width: 20, height: 15 },
    },
    {
      href: 'https://www.facebook.com/elenap0p0va',
      label: 'Facebook',
      asset: { src: '/brand/social/facebook.svg', width: 11, height: 18 },
    },
  ];
  const socialNavigation = (
    <nav className="studio-footer-social" aria-label="Соціальні мережі">
      {socials
        .filter((social) => social.href)
        .map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${social.label} — нова вкладка`}
            title={social.label}
          >
            <StudioImage asset={social.asset} alt="" sizes="26px" fit="contain" />
          </a>
        ))}
    </nav>
  );

  if (focused) {
    return (
      <footer className="studio-footer-focused studio-wrap">
        <span>© {new Date().getFullYear()} ProPhoto Academy</span>
        {legalNavigation}
      </footer>
    );
  }

  return (
    <footer className={`studio-footer ${home ? 'studio-footer-home' : ''}`}>
      <div className="studio-footer-columns studio-wrap">
        <div className="studio-footer-inquiry">
          <h2 className="studio-label">Нове навчання чи зйомка</h2>
          <InquiryButton
            className="studio-button"
            subject="program-selection"
            source="consultation"
          >
            Залишити заявку <span aria-hidden="true">→</span>
          </InquiryButton>
          {socialNavigation}
        </div>
        <nav className="studio-footer-links" aria-label="Екосистема">
          <h2 className="studio-label">Екосистема</h2>
          <Link href="/academy">Академія</Link>
          <Link href={ecosystemPages.studio}>Студія</Link>
          <Link href={ecosystemPages.shop}>Shop</Link>
        </nav>
        <nav className="studio-footer-links" aria-label="Навчання">
          <h2 className="studio-label">Навчання</h2>
          <Link href={studioAcademyDestinations.courses}>Головні курси</Link>
          <Link href="/academy#workshops">Воркшопи</Link>
          <Link href="/academy#individual">Індивідуальне</Link>
          <Link href="/academy#corporate">Корпоративне</Link>
        </nav>
        <div className="studio-footer-contact">
          <h2 className="studio-label">Контакти</h2>
          <a href={`tel:${settings.phone}`}>{phoneLabel(settings.phone)}</a>
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
          <p>{settings.address}</p>
          <Link className="studio-footer-about" href="/about-us">
            Про академію
          </Link>
          {!home && (
            <Link className="studio-footer-all-contacts" href="/contacts">
              Усі контакти
            </Link>
          )}
        </div>
      </div>
      <div className="studio-footer-social-mobile studio-wrap">{socialNavigation}</div>
      <div className="studio-footer-legal-strip studio-wrap">{legalNavigation}</div>
      <Link href="/" className="studio-footer-mark" aria-label="ProPhoto — головна">
        <StudioImage
          asset={home ? studioAssets.home.imgLogoMark : studioAssets.components.imgLogoMark}
          alt="ProPhoto"
          sizes="100vw"
        />
      </Link>
    </footer>
  );
}
