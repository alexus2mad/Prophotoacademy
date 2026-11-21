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
      <section className={`${styles.hero} studio-dark`}>
        <StudioImage
          asset={image('image', studioAssets.aiArtwork.imgImgWs144001)}
          alt={text('image-alt')}
          className={`${styles.heroImage} ${styles.desktopImage}`}
          fit="cover"
          preload
          sizes="100vw"
        />
        <StudioImage
          asset={image('mobile-image', studioAssets.aiArtworkMobile.imgImgWs39001)}
          alt=""
          className={`${styles.heroImage} ${styles.mobileImage}`}
          fit="cover"
          eager
          sizes="100vw"
        />
        <div className={`${styles.heroContent} studio-wrap`}>
          <h1>
            <span>{text('hero-emphasis')}</span>
            {text('hero-title')}
          </h1>
          <p className={styles.facts}>{text('hero-description')}</p>
          <p className={styles.date}>
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
      <section className={`${styles.announcement} studio-band studio-dark`}>
        <div className="studio-wrap">
          <p className="studio-label studio-eyebrow">{text('announcement-eyebrow')}</p>
          <h2>{text('announcement-title')}</h2>
          <p className={styles.subtitle}>{deliveryDescription || text('hero-description')}</p>
          <p className={styles.when}>
            <span>{dateTime ? <time dateTime={dateTime}>{date}</time> : date}</span>
            {time && <span>{time}</span>}
          </p>
          <div id="intensive-offers" className={styles.prices} aria-label="Формати участі">
            {prices.map((option) => (
              <StudioIntensivePackage key={option.id} option={option} />
            ))}
          </div>
          {purchaseNotice && <p className={styles.purchaseNotice}>{purchaseNotice}</p>}
          {showInstallments && (
            <div className={styles.installments}>
              <InstallmentMethods prominent />
            </div>
          )}
          <p className={styles.practice}>{text('practice')}</p>
          <h3 className={styles.requirementsTitle}>{text('requirements-title')}</h3>
          <p className={styles.requirements}>{text('requirements-description')}</p>
          {!purchaseAvailable && (
            <div className={styles.announcementAction}>
              <StudioIntensiveAction inquiry={inquiry} purchaseAvailable={false} />
            </div>
          )}
        </div>
      </section>
      <StudioIntensiveProgram page={page} />
      <section className={`${styles.faculty} studio-band studio-dark`}>
        <div className="studio-wrap">
          <header>
            <div className={styles.lecturerLabel}>
              <p className="studio-label studio-eyebrow">{text('lecturer-eyebrow')}</p>
              <a
                href="https://www.instagram.com/photosone44ko/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Анастасії Князєвої"
              >
                <StudioImage asset={studioAssets.aiArtwork.imgSvg} alt="" />
              </a>
            </div>
            <h2 className="studio-title">{text('lecturer-name')}</h2>
          </header>
          <ul className={styles.experience}>
            {studioIntensiveExperience.map((item, i) => (
              <li key={item.title}>
                <h3>{text('faculty-' + i + '-title')}</h3>
                <span aria-hidden="true" />
                <p>{text('faculty-' + i + '-description')}</p>
              </li>
            ))}
          </ul>
          <p className={`${styles.clientsLabel} studio-label studio-eyebrow`}>
            {text('clients-title')}
          </p>
          <ul className={styles.clients}>
            {studioIntensiveClients.map((client, i) => (
              <li key={client}>{text('client-' + i)}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className={`${styles.works} studio-dark`}>
        <div className="studio-wrap">
          <h2 className="studio-title">
            {text('gallery-title')}
            <br />
            <span className="studio-hand">{text('gallery-emphasis')}</span> {text('gallery-end')}
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
      <div id="intensive-inquiry">
        <StudioInquirySection
          title={text(purchaseAvailable ? 'purchase-inquiry-title' : 'closed-inquiry-title')}
          hand={text(purchaseAvailable ? 'purchase-inquiry-emphasis' : 'closed-inquiry-emphasis')}
          description={note}
          context={inquiry}
        />
      </div>
      <StudioMobileAction spacing="spacious">
        <StudioIntensiveAction inquiry={inquiry} purchaseAvailable={purchaseAvailable} />
      </StudioMobileAction>
    </>
  );
}
