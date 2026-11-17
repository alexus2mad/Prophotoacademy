'use client';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';

import Link from 'next/link';
import { studioHomeBrandNavigation } from '@/components/behaviors/StudioHomeNavigation/hooks';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import { phoneLabel } from '@/lib/format';
import { ecosystemPages } from '@/lib/ecosystem';
import { studioHomeBrandHref } from '@/lib/studio-home/navigation';
import { useStudioHeader } from './hooks';
import type { StudioHeaderProps } from './types';

export function StudioHeader({ settings }: StudioHeaderProps) {
  const {
    path,
    brand,
    header,
    dialog,
    open,
    scrolled,
    focused,
    darkHero,
    secondary,
    usesInk,
    openMenu,
    closeMenu,
  } = useStudioHeader();
  const accountHref =
    process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages' ? '/demo/account' : '/account';
  const home = path === '/';
  const destinations = {
    studio: {
      name: 'Студія',
      label: '01 · Студія',
      alt: 'ProPhoto Studio',
      logo: studioAssets.menu.imgLogoStudio,
      links: [
        [`${ecosystemPages.studio}#cyclorama`, 'Циклорама'],
        [`${ecosystemPages.studio}#content-room`, 'Контент-зал'],
        [`${ecosystemPages.studio}#makeup`, 'Гримерна'],
      ],
    },
    academy: {
      name: 'Академія',
      label: '02 · Навчання',
      alt: 'ProPhoto Academy',
      logo: studioAssets.menu.imgLogoAcademy,
      links: [
        [studioAcademyDestinations.courses, 'Курси'],
        ['/academy#workshops', 'Воркшопи'],
        ['/academy#individual', 'Індивідуальне навчання'],
        ['/academy#corporate', 'Корпоративне навчання'],
      ],
    },
    shop: {
      name: 'Shop',
      label: '03 · Магазин',
      alt: 'ProPhoto Shop',
      logo: studioAssets.menu.imgLogoShop,
      links: [[`${ecosystemPages.shop}#equipment-selection`, 'Обладнання']],
    },
  } as const;
  const socials = [
    { href: settings.instagram, label: 'Instagram', asset: studioAssets.menu.imgSvg },
    { href: settings.telegram, label: 'Telegram', asset: studioAssets.menu.imgSvg1 },
    { href: settings.youtube, label: 'YouTube', asset: studioAssets.menu.imgSvg2 },
  ];

  return (
    <header
      ref={header}
      className={`studio-header ${darkHero ? 'studio-header-dark' : 'studio-header-light'} ${secondary ? 'studio-header-secondary' : ''} ${scrolled ? 'is-scrolled' : ''} ${focused ? 'studio-header-focused' : ''}`}
    >
      <div className="studio-header-inner studio-wrap">
        {!focused && (
          <Link
            href={accountHref}
            className="studio-header-account"
            aria-label="Кабінет студента"
            data-header-control="account"
            data-header-ink={usesInk('account')}
          >
            <StudioImage asset={studioAssets.homeMobile.imgSvg4} alt="" sizes="21px" />
          </Link>
        )}
        <Link
          href="/"
          className="studio-header-brand"
          aria-label="ProPhoto — головна"
          data-header-control="brand"
          data-header-ink={usesInk('brand')}
          onNavigate={studioHomeBrandNavigation(home, 'academy')}
        >
          <StudioImage
            asset={darkHero ? studioAssets.home.imgLogoMark1 : studioAssets.contacts.imgLogoMark1}
            alt="ProPhoto"
            sizes="132px"
            eager
          />
        </Link>
        {focused ? (
          <Link href={studioAcademyDestinations.overview} className="studio-header-back">
            До програм
          </Link>
        ) : (
          <>
            <nav className="studio-header-nav" aria-label="Головна навігація">
              {(['academy', 'studio', 'shop'] as const).map((mode) => (
                <Link
                  key={mode}
                  href={studioHomeBrandHref(mode)}
                  aria-current={brand === mode ? 'location' : undefined}
                  data-header-control={mode}
                  data-header-ink={usesInk(mode)}
                  onNavigate={studioHomeBrandNavigation(home, mode)}
                >
                  {destinations[mode].name}
                </Link>
              ))}
              <Link
                href="/contacts"
                aria-current={path === '/contacts' ? 'page' : undefined}
                data-header-control="/contacts"
                data-header-ink={usesInk('/contacts')}
              >
                Контакти
              </Link>
            </nav>
            <button
              type="button"
              className="studio-menu-toggle"
              data-header-control="menu"
              data-header-ink={usesInk('menu')}
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
            {(['studio', 'academy', 'shop'] as const).map((mode) => (
              <section key={mode} className="studio-menu-group">
                <p className="studio-menu-label">{destinations[mode].label}</p>
                <Link
                  href={studioHomeBrandHref(mode)}
                  className="studio-menu-logo"
                  aria-current={brand === mode ? 'location' : undefined}
                  onNavigate={studioHomeBrandNavigation(home, mode, closeMenu)}
                >
                  <StudioImage
                    asset={destinations[mode].logo}
                    alt={destinations[mode].alt}
                    sizes="(max-width: 767px) 338px, 270px"
                  />
                </Link>
                <ul>
                  {destinations[mode].links.map(([href, label]) => (
                    <li key={label}>
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
