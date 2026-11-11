'use client';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import { useStudioHomeHero } from './hooks';
import type { StudioHomeHeroProps } from './types';
import styles from './StudioHomeHero.module.css';

export function StudioHomeHero({ mode, onModeChange }: StudioHomeHeroProps) {
  const {
    hero,
    tabs,
    visibleImage,
    retainedImages,
    playing,
    stop,
    select,
    onImageLoad,
    onImageTransitionEnd,
    onTouchStart,
    onTouchEnd,
    onTabKeyDown,
  } = useStudioHomeHero({ mode, onModeChange });
  const states = {
    studio: {
      image: studioAssets.artifact.hero_space,
      mobileImage: studioAssets.homeStudioMobile.imgImgHome390Studio01,
      kick: 'простір, щоб',
      mobileKick: 'простір, щоб',
      label: 'Забронювати студію',
      href: ecosystemDestinations.studioBooking,
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
      href: ecosystemDestinations.shop,
      logo: studioAssets.home.imgLogoShop,
      mobileLogo: studioAssets.homeMobile.imgLogoShop,
      caption: 'техніка для зйомки',
      name: 'Shop',
    },
  };
  const selected = states[mode];
  const visuals = [
    { id: 'academy-0', image: states.academy.image, mobileImage: states.academy.mobileImage },
    { id: 'academy-1', image: studioAssets.artifact.hero_studio, mobileImage: undefined },
    { id: 'academy-2', image: studioAssets.artifact.hero_shop, mobileImage: undefined },
    { id: 'studio', image: states.studio.image, mobileImage: states.studio.mobileImage },
    { id: 'shop', image: states.shop.image, mobileImage: states.shop.mobileImage },
  ];
  return (
    <section
      className={styles.hero}
      data-home-section="hero"
      aria-label="Екосистема ProPhoto"
      ref={hero}
      onMouseEnter={stop}
      onFocusCapture={stop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onLoadCapture={onImageLoad}
      data-motion-playing={playing}
    >
      {visuals.map((visual) => (
        <div
          key={visual.id}
          className={`${styles.image} ${visual.id === 'studio' ? styles.panorama : ''}`}
          data-hero-visual={visual.id}
          data-active={visibleImage === visual.id}
          data-motion-ready={visibleImage === visual.id || retainedImages.includes(visual.id)}
          onTransitionEnd={onImageTransitionEnd}
          aria-hidden="true"
        >
          <StudioHomePicture
            image={visual.image}
            mobileImage={visual.mobileImage}
            alt=""
            eager
            sizes="100vw"
          />
        </div>
      ))}
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
              onClick={() => select(key)}
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
