'use client';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import { useStudioHomeTabs } from './hooks';
import type { StudioHomeHeroProps } from './types';
import styles from './StudioHomeHero.module.css';

export function StudioHomeHero({ mode, onModeChange }: StudioHomeHeroProps) {
  const { tabs, onTabKeyDown } = useStudioHomeTabs();
  const states = {
    studio: {
      image: studioAssets.artifact.hero_space,
      mobileImage: studioAssets.homeStudioMobile.imgImgHome390Studio01,
      kick: 'простір, щоб',
      mobileKick: 'простір, щоб',
      label: 'Забронювати студію',
      href: '/photo-studio#studio-booking',
      logo: studioAssets.home.imgLogoStudio,
      mobileLogo: studioAssets.homeMobile.imgLogoStudio,
      caption: 'оренда залів',
      name: 'Studio',
    },
    academy: {
      image: studioAssets.home.imgImgHome144001,
      mobileImage: studioAssets.homeMobile.imgImgHome39001,
      kick: 'вчимо',
      mobileKick: 'вчимо, як',
      label: 'Обрати курс',
      href: '/courses',
      logo: studioAssets.home.imgLogoAcademy,
      mobileLogo: studioAssets.homeMobile.imgLogoAcademy,
      caption: 'курси і воркшопи',
      name: 'Academy',
    },
    shop: {
      image: studioAssets.shop.imgHero,
      mobileImage: studioAssets.homeShopMobile.imgImgHome390Shop01,
      kick: 'техніка, щоб',
      mobileKick: 'техніка, щоб',
      label: 'Підібрати техніку',
      href: '/shop#equipment-selection',
      logo: studioAssets.home.imgLogoShop,
      mobileLogo: studioAssets.homeMobile.imgLogoShop,
      caption: 'техніка для зйомки',
      name: 'Shop',
    },
  };
  const selected = states[mode];
  return (
    <section className={styles.hero} data-home-section="hero" aria-label="Екосистема ProPhoto">
      <StudioHomePicture
        image={selected.image}
        mobileImage={selected.mobileImage}
        alt=""
        className={styles.image}
        eager
        sizes="100vw"
      />
      <div className={`${styles.body} studio-wrap`}>
        <div
          id="home-hero-panel"
          role="tabpanel"
          aria-labelledby={`home-tab-${mode}`}
          className={styles.title}
        >
          <p className={styles.kick}>
            <span aria-hidden="true">*</span>
            <span className={styles.desktopKick}>{selected.kick}</span>
            <span className={styles.mobileKick}>{selected.mobileKick}</span>
          </p>
          <h1>Бачити більше</h1>
        </div>
        <div className={styles.foot}>
          <Link className="studio-button" href={selected.href}>
            {selected.label}
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Напрями ProPhoto" ref={tabs}>
          {(['studio', 'academy', 'shop'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`home-tab-${key}`}
              aria-controls="home-hero-panel"
              aria-selected={mode === key}
              tabIndex={mode === key ? 0 : -1}
              onClick={() => onModeChange(key)}
              onKeyDown={onTabKeyDown}
              className={styles.tab}
              data-brand={key}
            >
              <span className={styles.tabLogo} aria-hidden="true">
                <StudioImage asset={states[key].logo} alt="" className={styles.desktopLogo} />
                <StudioImage asset={states[key].mobileLogo} alt="" className={styles.mobileLogo} />
              </span>
              <span className={styles.srOnly}>{states[key].name}</span>
              <small>{states[key].caption}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
