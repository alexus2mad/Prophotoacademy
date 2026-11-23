import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { artworkWorkshop, featuredArtworks } from '@/lib/site-editor/brand/artwork/workshop';
import { bindSection } from '@/lib/site-editor/bind-section';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioIntensiveAction } from '@/components/molecules/StudioIntensiveAction/StudioIntensiveAction';
import { StudioIntensivePackage } from '@/components/molecules/StudioIntensivePackage/StudioIntensivePackage';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { InstallmentMethods } from '@/components/molecules/InstallmentMethods/InstallmentMethods';
import { StudioIntensiveProgram } from '@/components/organisms/StudioIntensiveProgram/StudioIntensiveProgram';
import { StudioSpacesGallery } from '@/components/organisms/StudioSpacesGallery/StudioSpacesGallery';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import { studioAssets } from '@/lib/studio-design/assets';
import {
  studioIntensiveOffer,
  studioIntensiveExperience,
  studioIntensiveClients,
} from '@/lib/studio-pages/intensive';
import type { StudioIntensiveTemplateProps } from './types';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import styles from './StudioIntensiveTemplate.module.css';

export function StudioIntensiveTemplate({
  page,
  content,
  enrollment,
}: StudioIntensiveTemplateProps) {
  const { text, image } = bindSection(page, artworkWorkshop);
  const {
    inquiry,
    deliveryDescription,
    date,
    dateTime,
    time,
    prices,
    purchaseAvailable,
    showInstallments,
    purchaseNotice,
    note,
  } = studioIntensiveOffer(content, enrollment);
  return (
    <>
      <MarketingSlot page={page} id="hero" />
      <section data-site-section="workshop" className={`${styles.hero} studio-dark`}>
        <StudioImage
          fieldId="image"
          asset={image('image', studioAssets.aiArtwork.imgImgWs144001)}
          alt={text('image-alt')}
          className={`${styles.heroImage} ${styles.desktopImage}`}
          fit="cover"
          preload
          sizes="100vw"
        />
        <StudioImage
          fieldId="mobile-image"
          asset={image('mobile-image', studioAssets.aiArtworkMobile.imgImgWs39001)}
          alt=""
          className={`${styles.heroImage} ${styles.mobileImage}`}
          fit="cover"
          eager
          sizes="100vw"
        />
        <div className={`${styles.heroContent} studio-wrap`}>
          <h1>
            <span data-site-field="hero-emphasis">{text('hero-emphasis')}</span>
            <SiteCopy id="hero-title">{text('hero-title')}</SiteCopy>
          </h1>
          <p data-site-field="hero-description" className={styles.facts}>
            {text('hero-description')}
          </p>
          <p data-site-locked="" className={styles.date}>
            <span>{dateTime ? <time dateTime={dateTime}>{date}</time> : date}</span>
            {time && <span>{time}</span>}
          </p>
          <div className={`${styles.heroActions} studio-actions`}>
            <StudioIntensiveAction inquiry={inquiry} purchaseAvailable={purchaseAvailable} />
            <a href="#intensive-program" className="studio-button-outline">
              {text('program-action')}
            </a>
          </div>
        </div>
      </section>
      <MarketingSlot page={page} id="announcement" />
      <section
        data-site-section="workshop"
        className={`${styles.announcement} studio-band studio-dark`}
      >
        <div className="studio-wrap">
          <p data-site-field="announcement-eyebrow" className="studio-label studio-eyebrow">
            {text('announcement-eyebrow')}
          </p>
          <h2 data-site-field="announcement-title">{text('announcement-title')}</h2>
          <p
            data-site-field={deliveryDescription ? undefined : 'hero-description'}
            data-site-locked={deliveryDescription ? '' : undefined}
            className={styles.subtitle}
          >
            {deliveryDescription || text('hero-description')}
          </p>
          <p data-site-locked="" className={styles.when}>
            <span>{dateTime ? <time dateTime={dateTime}>{date}</time> : date}</span>
            {time && <span>{time}</span>}
          </p>
          <div
            id="intensive-offers"
            data-site-locked=""
            className={styles.prices}
            aria-label="Формати участі"
          >
            {prices.map((option) => (
              <StudioIntensivePackage key={option.id} option={option} />
            ))}
          </div>
          {purchaseNotice && (
            <p data-site-locked="" className={styles.purchaseNotice}>
              {purchaseNotice}
            </p>
          )}
          {showInstallments && (
            <div data-site-locked="" className={styles.installments}>
              <InstallmentMethods prominent />
            </div>
          )}
          <p data-site-field="practice" className={styles.practice}>
            {text('practice')}
          </p>
          <h3 data-site-field="requirements-title" className={styles.requirementsTitle}>
            {text('requirements-title')}
          </h3>
          <p data-site-field="requirements-description" className={styles.requirements}>
            {text('requirements-description')}
          </p>
          {!purchaseAvailable && (
            <div className={styles.announcementAction}>
              <StudioIntensiveAction inquiry={inquiry} purchaseAvailable={false} />
            </div>
          )}
        </div>
      </section>
      <MarketingSlot page={page} id="curriculum" />
      <StudioIntensiveProgram page={page} />
      <MarketingSlot page={page} id="faculty" />
      <section data-site-section="workshop" className={`${styles.faculty} studio-band studio-dark`}>
        <div className="studio-wrap">
          <header>
            <div className={styles.lecturerLabel}>
              <p data-site-field="lecturer-eyebrow" className="studio-label studio-eyebrow">
                {text('lecturer-eyebrow')}
              </p>
              <a
                href="https://www.instagram.com/photosone44ko/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Анастасії Князєвої"
              >
                <StudioImage asset={studioAssets.aiArtwork.imgSvg} alt="" />
              </a>
            </div>
            <h2 data-site-field="lecturer-name" className="studio-title">
              {text('lecturer-name')}
            </h2>
          </header>
          <ul className={styles.experience}>
            {studioIntensiveExperience.map((item, i) => (
              <li key={item.title}>
                <h3 data-site-field={'faculty-' + i + '-title'}>
                  {text('faculty-' + i + '-title')}
                </h3>
                <span aria-hidden="true" />
                <p data-site-field={'faculty-' + i + '-description'}>
                  {text('faculty-' + i + '-description')}
                </p>
              </li>
            ))}
          </ul>
          <p
            data-site-field="clients-title"
            className={`${styles.clientsLabel} studio-label studio-eyebrow`}
          >
            {text('clients-title')}
          </p>
          <ul className={styles.clients}>
            {studioIntensiveClients.map((client, i) => (
              <li data-site-field={'client-' + i} key={client}>
                {text('client-' + i)}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <MarketingSlot page={page} id="gallery" />
      <section data-site-section="workshop" className={`${styles.works} studio-dark`}>
        <div className="studio-wrap">
          <h2 className="studio-title">
            <SiteCopy id="gallery-title">{text('gallery-title')}</SiteCopy>
            <br />
            <span data-site-field="gallery-emphasis" className="studio-hand">
              {text('gallery-emphasis')}
            </span>{' '}
            <SiteCopy id="gallery-end">{text('gallery-end')}</SiteCopy>
          </h2>
          <StudioSpacesGallery
            variant="artworks"
            label={text('gallery-name')}
            images={featuredArtworks.map((work, i) => ({
              asset: image('work-' + i + '-image', work.asset),
              alt: text('work-' + i + '-image-alt'),
            }))}
          />
        </div>
      </section>
      <MarketingSlot page={page} id="inquiry" />
      <div id="intensive-inquiry">
        <StudioInquirySection
          identifiers={{
            section: 'workshop',
            title: purchaseAvailable ? 'purchase-inquiry-title' : 'closed-inquiry-title',
            hand: purchaseAvailable ? 'purchase-inquiry-emphasis' : 'closed-inquiry-emphasis',
          }}
          title={text(purchaseAvailable ? 'purchase-inquiry-title' : 'closed-inquiry-title')}
          hand={text(purchaseAvailable ? 'purchase-inquiry-emphasis' : 'closed-inquiry-emphasis')}
          description={note}
          context={inquiry}
        />
      </div>
      <MarketingComposition page={page} />
      <StudioMobileAction spacing="spacious">
        <StudioIntensiveAction inquiry={inquiry} purchaseAvailable={purchaseAvailable} />
      </StudioMobileAction>
    </>
  );
}
