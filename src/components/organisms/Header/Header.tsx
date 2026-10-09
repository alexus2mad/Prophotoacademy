'use client';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { EcosystemNav } from '@/components/molecules/EcosystemNav/EcosystemNav';
import { siteHref } from '@/lib/ecosystem';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useHeader } from './hooks';
import type { HeaderProps } from './types';

export function Header({ site = 'academy' }: HeaderProps) {
  const { path, scrolled, dialog, focused, home, links } = useHeader({ site });
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
                href={siteHref(site, site === 'hub' ? 'booking' : 'courses')}
                className={`button button-small ${site === 'academy' && home ? 'button-secondary' : ''}`}
              >
                {site === 'hub' ? 'Забронювати' : home ? 'Усі програми' : 'Обрати курс'}
              </Link>
              <button
                className="icon-button menu-toggle"
                onClick={() => dialog.current?.showModal()}
                aria-label="Відкрити меню"
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
          <nav aria-label="Мобільна навігація">
            {(site === 'hub'
              ? [
                  [siteHref('hub', '#spaces'), 'Зали'],
                  [siteHref('hub', 'booking'), 'Бронювання'],
                  [siteHref('hub', 'contact'), 'Контакти'],
                ]
              : [['/courses', 'Програми'], ...links, ['/contacts', 'Контакти']]
            ).map(([href, label]) => (
              <Link key={href} href={href} onClick={() => dialog.current?.close()}>
                {label}
              </Link>
            ))}
          </nav>
          <EcosystemNav site={site} onNavigate={() => dialog.current?.close()} />
        </Dialog>
      </div>
    </header>
  );
}
