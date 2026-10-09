'use client';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { siteHref } from '@/lib/ecosystem';
import { phoneLabel } from '@/lib/format';
import Link from 'next/link';
import { useFooter } from './hooks';
import type { FooterProps } from './types';

export function Footer({ settings }: FooterProps) {
  const { focused } = useFooter();
  if (focused)
    return (
      <footer className="site-footer footer-focused">
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Pro Photo Academy</span>
          <div>
            <Link href="/terms-of-service">Публічна оферта</Link>
            <Link href="/privacy-policy">Конфіденційність</Link>
          </div>
        </div>
      </footer>
    );
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href="/" className="brand-link" aria-label="Pro Photo Academy — головна">
              <BrandLogo large />
            </Link>
          </div>
          <nav aria-label="Навігація у підвалі">
            <Link href="/courses">Програми</Link>
            <Link href="/student-work">Роботи студентів</Link>
            <Link href="/about-us">Академія</Link>
            <Link href="/reviews">Відгуки</Link>
            <Link href="/contacts">Контакти</Link>
            <a href={siteHref('hub')} data-ecosystem-target="hub">
              ProPhoto Hub · студія
            </a>
          </nav>
          <div className="footer-contact">
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <a href={`tel:${settings.phone}`}>{phoneLabel(settings.phone)}</a>
            <span>{settings.address}</span>
            <div className="footer-social">
              <a href={settings.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href={settings.telegram} target="_blank" rel="noreferrer">
                Telegram
              </a>
              <a href={settings.shop} target="_blank" rel="noreferrer">
                Магазин
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Pro Photo Academy</span>
          <div>
            <Link href="/terms-of-service">Публічна оферта</Link>
            <Link href="/privacy-policy">Конфіденційність</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
