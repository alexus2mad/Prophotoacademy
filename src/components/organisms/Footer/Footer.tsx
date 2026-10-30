'use client';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { siteHref } from '@/lib/ecosystem';
import { phoneLabel } from '@/lib/format';
import { academyNavigation } from '@/lib/navigation/academy';
import Link from 'next/link';
import { useFooter } from './hooks';
import type { FooterProps } from './types';

export function Footer({ settings }: FooterProps) {
  const { focused, path } = useFooter();
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
          <div className="footer-brand">
            <Link href="/" className="brand-link" aria-label="Pro Photo Academy — головна">
              <BrandLogo large />
            </Link>
            <p>
              Фотографія, відео та контент.
              <br />
              Навчання онлайн і практика в Києві.
            </p>
          </div>
          <nav aria-label="Навігація у підвалі">
            <h2 className="footer-group-title">Навчання</h2>
            {academyNavigation.map(([href, label]) => (
              <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
                {label}
              </Link>
            ))}
            <Link href="/reviews" aria-current={path === '/reviews' ? 'page' : undefined}>
              Відгуки
            </Link>
            <a
              href={siteHref('hub')}
              data-ecosystem-target="hub"
              aria-label="ProPhoto Hub · студія — окремий сайт"
            >
              ProPhoto Hub · студія
            </a>
          </nav>
          <div className="footer-contact">
            <h2 className="footer-group-title">Будьмо на зв’язку</h2>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <a href={`tel:${settings.phone}`}>{phoneLabel(settings.phone)}</a>
            <span>{settings.address}</span>
            <div className="footer-social">
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram — нова вкладка"
              >
                Instagram
              </a>
              <a
                href={settings.telegram}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram — нова вкладка"
              >
                Telegram
              </a>
              <a
                href={settings.shop}
                target="_blank"
                rel="noreferrer"
                aria-label="Магазин ProPhoto — окремий сайт, нова вкладка"
              >
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
