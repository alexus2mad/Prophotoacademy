'use client';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { EcosystemNav } from '@/components/molecules/EcosystemNav/EcosystemNav';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { siteHref } from '@/lib/ecosystem';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useHeader } from './hooks';
import type { HeaderProps } from './types';

export function Header({ site = 'academy' }: HeaderProps) {
  const { path, scrolled, dialog, focused, home, links, mobileLinks } = useHeader({ site });
  return (
    <header
      className={`site-header ${scrolled ? 'is-scrolled' : ''} ${focused ? 'header-focused' : ''}`}
    >
      <div className="container header-inner">
        <Link
          href={siteHref(site)}
          className="brand-link"
          aria-label={`${site === 'hub' ? 'ProPhoto Hub' : 'Pro Photo Academy'} — головна`}
        >
          <BrandLogo site={site} />
        </Link>
        {!focused && <EcosystemNav site={site} />}
        {!focused && (
          <nav className="desktop-nav" aria-label="Головна навігація">
            {links.map(([href, label]) => (
              <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
                {label}
              </Link>
            ))}
          </nav>
        )}
        <div className="header-actions">
          {focused ? (
            <Link href={siteHref(site, site === 'hub' ? '' : 'courses')} className="text-link">
              {site === 'hub' ? 'До студії' : 'До програм'}
            </Link>
          ) : (
            <>
              <Link
                href={siteHref(
                  'academy',
                  process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages' ? 'demo/account' : 'account',
                )}
                className="header-account-link"
                aria-label="Кабінет студента"
              >
                Кабінет
              </Link>
              {site === 'academy' && path === '/courses' ? (
                <InquiryButton
                  className="button button-small"
                  subject="program-selection"
                  source="header"
                />
              ) : (
                <Link
                  href={siteHref(site, site === 'hub' ? 'booking' : 'courses')}
                  className={`button button-small ${site === 'academy' && home ? 'button-secondary' : ''}`}
                >
                  {site === 'hub' ? 'Забронювати' : 'Обрати програму'}
                </Link>
              )}
              <button
                type="button"
                className="icon-button menu-toggle"
                onClick={() => dialog.current?.showModal()}
                aria-label="Відкрити меню"
                aria-haspopup="dialog"
              >
                <Menu size={22} />
              </button>
            </>
          )}
        </div>
        <Dialog
          dialogRef={dialog}
          className="menu-dialog"
          aria-label={site === 'hub' ? 'Меню студії' : 'Меню академії'}
          closeLabel="Закрити меню"
          closeOnBackdrop
        >
          {site === 'academy' && <p className="menu-eyebrow">ProPhoto Academy</p>}
          <nav className="menu-primary" aria-label="Мобільна навігація">
            {site === 'hub' && (
              <Link
                href={siteHref(
                  'academy',
                  process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages' ? 'demo/account' : 'account',
                )}
                onClick={() => dialog.current?.close()}
              >
                Кабінет
              </Link>
            )}
            {mobileLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? 'page' : undefined}
                onClick={() => dialog.current?.close()}
              >
                {label}
              </Link>
            ))}
          </nav>
          {site === 'academy' && (
            <Link
              href={siteHref(
                'academy',
                process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages' ? 'demo/account' : 'account',
              )}
              className="menu-account-link"
              onClick={() => dialog.current?.close()}
            >
              Кабінет студента
            </Link>
          )}
          <EcosystemNav site={site} onNavigate={() => dialog.current?.close()} />
        </Dialog>
      </div>
    </header>
  );
}
