'use client';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { siteHref } from '@/lib/ecosystem';
import { phoneLabel } from '@/lib/format';
import Link from 'next/link';
import { useHubFooter } from './hooks';
import type { HubFooterProps } from './types';

export function HubFooter({ settings }: HubFooterProps) {
  const { booking } = useHubFooter();
  return (
    <footer className="site-footer">
      <div className="container">
        {!booking && (
          <div className="footer-top">
            <div>
              <Link href={siteHref('hub')} aria-label="ProPhoto Hub — головна">
                <BrandLogo site="hub" large />
              </Link>
              <p className="ecosystem-signature">Знання та простір для створення контенту</p>
            </div>
            <nav aria-label="Навігація у підвалі">
              <Link href={siteHref('hub', '#spaces')}>Зали</Link>
              <Link href={siteHref('hub', 'booking')}>Бронювання</Link>
              <Link href={siteHref('hub', 'contact')}>Контакти</Link>
              <Link href={siteHref('hub', 'about')}>Про ProPhoto</Link>
              <a href={siteHref('academy')} data-ecosystem-target="academy">
                ProPhoto Academy · навчання
              </a>
            </nav>
            <div className="footer-contact">
              <a href={`tel:${settings.phone}`}>{phoneLabel(settings.phone)}</a>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
              <span>
                {settings.address}
                <br />
                {settings.arrival}
              </span>
              <div className="footer-social">
                <a href={settings.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href={settings.mapsUrl} target="_blank" rel="noreferrer">
                  На мапі
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ProPhoto Hub</span>
          <div>
            {settings.termsUrl && <a href={settings.termsUrl}>Правила оренди</a>}
            <a href={settings.privacyUrl}>Конфіденційність</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
