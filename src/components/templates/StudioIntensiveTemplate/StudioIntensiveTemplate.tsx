import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioIntensiveAction } from '@/components/molecules/StudioIntensiveAction/StudioIntensiveAction';
import { StudioIntensivePackage } from '@/components/molecules/StudioIntensivePackage/StudioIntensivePackage';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
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

export function StudioIntensiveTemplate({ content, enrollment }: StudioIntensiveTemplateProps) {
  const {
    inquiry,
    deliveryDescription,
    date,
    dateTime,
    time,
    prices,
    purchaseAvailable,
    purchaseNotice,
    note,
  } = studioIntensiveOffer(content, enrollment);
  return (
    <>
      <section className={`${styles.hero} studio-dark`}>
        <StudioImage
          asset={studioAssets.aiArtwork.imgImgWs144001}
          alt="Модель у білій сукні серед троянд"
          className={`${styles.heroImage} ${styles.desktopImage}`}
          fit="cover"
          preload
          sizes="100vw"
        />
        <StudioImage
          asset={studioAssets.aiArtworkMobile.imgImgWs39001}
          alt=""
          className={`${styles.heroImage} ${styles.mobileImage}`}
          fit="cover"
          eager
          sizes="100vw"
        />
        <div className={`${styles.heroContent} studio-wrap`}>
          <h1>
            <span>*від кадрів до</span>AI artwork
          </h1>
          <p className={styles.facts}>студійна зйомка + генеративна обробка</p>
          <p className={styles.date}>
            <span>{dateTime ? <time dateTime={dateTime}>{date}</time> : date}</span>
            {time && <span>{time}</span>}
          </p>
          <div className={`${styles.heroActions} studio-actions`}>
            <StudioIntensiveAction inquiry={inquiry} purchaseAvailable={purchaseAvailable} />
            <a href="#intensive-program" className="studio-button-outline">
              Програма
            </a>
          </div>
        </div>
      </section>
      <section className={`${styles.announcement} studio-band studio-dark`}>
        <div className="studio-wrap">
          <p className="studio-label studio-eyebrow">Анонс</p>
          <h2>Практичний інтенсив</h2>
          <p className={styles.subtitle}>
            {deliveryDescription || 'студійна зйомка + генеративна обробка'}
          </p>
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
          <p className={styles.practice}>4–5 годин практики</p>
          <h3 className={styles.requirementsTitle}>Photoshop + Firefly</h3>
          <p className={styles.requirements}>
            Потрібен ноутбук із встановленим Adobe Photoshop та активними генеративними кредитами
            або підпискою Cloud Pro для роботи з Adobe Firefly.
          </p>
          {!purchaseAvailable && (
            <div className={styles.announcementAction}>
              <StudioIntensiveAction inquiry={inquiry} purchaseAvailable={false} />
            </div>
          )}
        </div>
      </section>
      <StudioIntensiveProgram />
      <section className={`${styles.faculty} studio-band studio-dark`}>
        <div className="studio-wrap">
          <header>
            <div className={styles.lecturerLabel}>
              <p className="studio-label studio-eyebrow">Ваша лекторка</p>
              <a
                href="https://www.instagram.com/photosone44ko/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Анастасії Князєвої"
              >
                <StudioImage asset={studioAssets.aiArtwork.imgSvg} alt="" />
              </a>
            </div>
            <h2 className="studio-title">Анастасія Князєва</h2>
          </header>
          <ul className={styles.experience}>
            {studioIntensiveExperience.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <span aria-hidden="true" />
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
          <p className={`${styles.clientsLabel} studio-label studio-eyebrow`}>Створювала арт для</p>
          <ul className={styles.clients}>
            {studioIntensiveClients.map((client) => (
              <li key={client}>{client}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className={`${styles.works} studio-dark`}>
        <div className="studio-wrap">
          <h2 className="studio-title">
            Роботи, які ти
            <br />
            <span className="studio-hand">*навчишся</span> створювати
          </h2>
          <StudioSpacesGallery
            variant="artworks"
            label="Роботи AI artwork"
            images={[
              {
                asset: studioAssets.aiArtwork.imgImgWs144002,
                alt: 'Фантазійний портрет серед скульптурних дерев і квітів',
              },
              {
                asset: studioAssets.aiArtwork.imgImgWs144003,
                alt: 'Портрет дівчини з квітами у волоссі на блакитному тлі',
              },
              {
                asset: studioAssets.artifact.ws_art3,
                alt: 'Авторська сюрреалістична композиція з квітами',
              },
              {
                asset: studioAssets.artifact.ws_art4,
                alt: 'Авторська робота Анастасії Князєвої з генеративною обробкою',
              },
            ]}
          />
        </div>
      </section>
      <div id="intensive-inquiry">
        <StudioInquirySection
          title={purchaseAvailable ? 'Маєте' : 'Залиште'}
          hand={purchaseAvailable ? 'запитання' : 'заявку'}
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
