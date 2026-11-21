'use client';
import { homeHero, homeVisuals, homeModes } from '@/lib/site-editor/brand/home/hero';
import { bindSection } from '@/lib/site-editor/bind-section';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { useStudioHomeHero } from './hooks';
import type { StudioHomeHeroProps } from './types';
import styles from './StudioHomeHero.module.css';

export function StudioHomeHero({ page, mode, onModeChange }: StudioHomeHeroProps) {
  const { text, image } = bindSection(page, homeHero);
  const {
    hero,
    tabs,
    visibleImage,
    retainedImages,
    playing,
    onImageLoad,
    onImageTransitionEnd,
    onTabKeyDown,
  } = useStudioHomeHero({ mode, onModeChange });
  const selected = homeModes[mode];
  return (
    <section
      className={styles.hero}
      data-home-section="hero"
      aria-label="Екосистема ProPhoto"
      ref={hero}
      onLoadCapture={onImageLoad}
      data-motion-playing={playing}
    >
      {homeVisuals.map((visual) => (
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
            image={image(visual.id + '-image', visual.image)}
            mobileImage={
              visual.mobileImage && image(visual.id + '-mobile-image', visual.mobileImage)
            }
            alt=""
            eager
            fetchPriority={visual.id === 'academy-0' ? 'high' : undefined}
            sizes={visual.id === 'shop' ? 'max(100vw, 150svh)' : '100vw'}
          />
        </div>
      ))}
      <div className={`${styles.body} studio-wrap`}>
        <div className={styles.title}>
          <p className={styles.kick}>
            <span aria-hidden="true">*</span>
            <span className={styles.desktopKick}>{text(mode + '-kick')}</span>
            <span className={styles.mobileKick}>{text(mode + '-mobile-kick')}</span>
          </p>
          <h1>{text('title')}</h1>
        </div>
        <div className={styles.foot}>
          <Link className="studio-button" href={selected.href}>
            {text(mode + '-cta')}
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
          {mode === 'studio' && (
            <a className={`studio-button-outline ${styles.roomsAction}`} href="#spaces">
              {text('rooms-action')}
            </a>
          )}
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Напрями ProPhoto" ref={tabs}>
          {(['studio', 'academy', 'shop'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`home-tab-${key}`}
              aria-controls={`home-panel-${key}`}
              aria-selected={mode === key}
              tabIndex={mode === key ? 0 : -1}
              onClick={() => onModeChange(key)}
              onKeyDown={onTabKeyDown}
              className={styles.tab}
              data-brand={key}
            >
              <span className={styles.tabLogo} aria-hidden="true">
                <StudioImage asset={homeModes[key].logo} alt="" className={styles.desktopLogo} />
                <StudioImage
                  asset={homeModes[key].mobileLogo}
                  alt=""
                  className={styles.mobileLogo}
                />
              </span>
              <span className={styles.srOnly}>{homeModes[key].name}</span>
              <small>{text(key + '-caption')}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
