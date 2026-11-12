'use client';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import { useStudioHomeHero } from './hooks';
import styles from './StudioHomeHero.module.css';

const brands = [
  {
    key: 'studio',
    name: 'Studio',
    caption: 'оренда залів',
    href: ecosystemDestinations.studio,
    logo: studioAssets.home.imgLogoStudio,
    mobileLogo: studioAssets.homeMobile.imgLogoStudio,
  },
  {
    key: 'academy',
    name: 'Academy',
    caption: 'курси і воркшопи',
    href: studioAcademyDestinations.overview,
    logo: studioAssets.home.imgLogoAcademy,
    mobileLogo: studioAssets.homeMobile.imgLogoAcademy,
  },
  {
    key: 'shop',
    name: 'Shop',
    caption: 'техніка для зйомки',
    href: ecosystemDestinations.shop,
    logo: studioAssets.home.imgLogoShop,
    mobileLogo: studioAssets.homeMobile.imgLogoShop,
  },
];

const portraits = [
  {
    id: 'academy-0',
    image: studioAssets.home.imgImgHome144001,
    mobileImage: studioAssets.homeMobile.imgImgHome39001,
  },
  { id: 'academy-1', image: studioAssets.artifact.hero_studio },
  { id: 'academy-2', image: studioAssets.artifact.hero_shop },
];

export function StudioHomeHero() {
  const { hero, visibleImage, retainedImages, playing, onImageLoad, onImageTransitionEnd } =
    useStudioHomeHero(portraits.length);
  return (
    <section
      className={styles.hero}
      data-home-section="hero"
      aria-label="ProPhoto Academy"
      ref={hero}
      onLoadCapture={onImageLoad}
      data-motion-playing={playing}
    >
      {portraits.map((visual) => (
        <div
          key={visual.id}
          className={styles.image}
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
            fetchPriority={visual.id === 'academy-0' ? 'high' : undefined}
            sizes="100vw"
          />
        </div>
      ))}
      <div className={`${styles.body} studio-wrap`}>
        <div className={styles.title}>
          <p className={styles.kick}>
            <span aria-hidden="true">*</span>
            <span className={styles.desktopKick}>вчимо</span>
            <span className={styles.mobileKick}>вчимо, як</span>
          </p>
          <h1>Бачити більше</h1>
        </div>
        <div className={styles.foot}>
          <Link className="studio-button" href={studioAcademyDestinations.overview}>
            Обрати курс
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <nav className={styles.brands} aria-label="Напрями ProPhoto">
          {brands.map(({ key, name, caption, href, logo, mobileLogo }) => (
            <Link
              key={key}
              href={href}
              aria-current={key === 'academy' ? 'true' : undefined}
              className={styles.brand}
              data-brand={key}
            >
              <span className={styles.brandLogo} aria-hidden="true">
                <StudioImage asset={logo} alt="" className={styles.desktopLogo} />
                <StudioImage asset={mobileLogo} alt="" className={styles.mobileLogo} />
              </span>
              <span className={styles.srOnly}>{name}</span>
              <small>{caption}</small>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
