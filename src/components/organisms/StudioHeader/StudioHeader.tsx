'use client';

import Link from 'next/link';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import { phoneLabel } from '@/lib/format';
import { useStudioHeader } from './hooks';
import type { StudioHeaderProps } from './types';

export function StudioHeader({ settings }: StudioHeaderProps) {
  const { path, dialog, open, scrolled, focused, darkHero, openMenu, closeMenu } =
    useStudioHeader();
  const accountHref =
    process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages' ? '/demo/account' : '/account';
  const destinations = [
    {
      href: '/photo-studio',
      label: '01 · Студія',
      alt: 'ProPhoto Studio',
      logo: studioAssets.menu.imgLogoStudio,
      links: [
        ['/photo-studio#cyclorama', 'Циклорама'],
        ['/photo-studio#content-room', 'Контент-зал'],
        ['/photo-studio#makeup', 'Гримерна'],
      ],
    },
    {
      href: '/academy',
      label: '02 · Навчання',
      alt: 'ProPhoto Academy',
      logo: studioAssets.menu.imgLogoAcademy,
      links: [
        ['/courses?category=course', 'Курси'],
        ['/academy#workshops', 'Воркшопи'],
        ['/academy#individual', 'Індивідуальне навчання'],
        ['/academy#corporate', 'Корпоративне навчання'],
      ],
    },
    {
      href: '/shop',
      label: '03 · Магазин',
      alt: 'ProPhoto Shop',
      logo: studioAssets.menu.imgLogoShop,
      links: [['/shop', 'Обладнання']],
    },
  ];
  const socials = [
    { href: settings.instagram, label: 'Instagram', asset: studioAssets.menu.imgSvg },
    { href: settings.telegram, label: 'Telegram', asset: studioAssets.menu.imgSvg1 },
    { href: settings.youtube, label: 'YouTube', asset: studioAssets.menu.imgSvg2 },
  ];

  return (
    <header
      className={`studio-header ${darkHero ? 'studio-header-dark' : 'studio-header-light'} ${scrolled ? 'is-scrolled' : ''} ${focused ? 'studio-header-focused' : ''}`}
    >
      <div className="studio-header-inner studio-wrap">
        {!focused && (
          <Link href={accountHref} className="studio-header-account" aria-label="Кабінет студента">
            <StudioImage asset={studioAssets.homeMobile.imgSvg4} alt="" sizes="21px" />
          </Link>
        )}
        <Link href="/" className="studio-header-brand" aria-label="ProPhoto — головна">
          <StudioImage
            asset={darkHero ? studioAssets.home.imgLogoMark1 : studioAssets.contacts.imgLogoMark1}
            alt="ProPhoto"
            sizes="132px"
            eager
          />
        </Link>
        {focused ? (
          <Link href="/courses" className="studio-header-back">
            До програм
          </Link>
        ) : (
          <>
            <nav className="studio-header-nav" aria-label="Головна навігація">
              {[
                ['/academy', 'Академія'],
                ['/photo-studio', 'Студія'],
                ['/shop', 'Shop'],
                ['/contacts', 'Контакти'],
              ].map(([href, label]) => (
                <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
                  {label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              className="studio-menu-toggle"
              aria-label="Відкрити меню"
              aria-haspopup="dialog"
              aria-controls="studio-menu"
              aria-expanded={open}
              onClick={openMenu}
            >
              <span />
              <span />
              <span />
            </button>
          </>
        )}
      </div>
      {!focused && (
        <dialog
          id="studio-menu"
          ref={dialog}
          className="studio-menu"
          aria-label="Меню ProPhoto"
          onClose={closeMenu}
        >
          <button
            type="button"
            className="studio-menu-close"
            aria-label="Закрити меню"
            onClick={closeMenu}
          >
            <span />
            <span />
          </button>
          <nav className="studio-menu-destinations" aria-label="Напрями ProPhoto">
            {destinations.map((destination) => (
              <section key={destination.href} className="studio-menu-group">
                <p className="studio-menu-label">{destination.label}</p>
                <Link href={destination.href} className="studio-menu-logo" onClick={closeMenu}>
                  <StudioImage
                    asset={destination.logo}
                    alt={destination.alt}
                    sizes="(max-width: 767px) 338px, 270px"
                  />
                </Link>
                <ul>
                  {destination.links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} onClick={closeMenu}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
          <div className="studio-menu-bottom">
            <nav className="studio-menu-secondary" aria-label="Додаткова навігація">
              <Link href="/academy#about" onClick={closeMenu}>
                Про нас
              </Link>
              <Link href="/reviews" onClick={closeMenu}>
                Відгуки
              </Link>
              <Link href="/contacts" onClick={closeMenu}>
                Контакти
              </Link>
              <Link href={accountHref} onClick={closeMenu}>
                Кабінет
              </Link>
            </nav>
            <div className="studio-menu-contact">
              <a href={`tel:${settings.phone}`}>{phoneLabel(settings.phone)}</a>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <div className="studio-menu-social">
              {socials
                .filter((social) => social.href)
                .map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label} — нова вкладка`}
                  >
                    <StudioImage asset={social.asset} alt="" sizes="18px" />
                  </a>
                ))}
            </div>
          </div>
        </dialog>
      )}
    </header>
  );
}
