import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioCreatorAction } from '@/components/molecules/StudioCreatorAction/StudioCreatorAction';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioCreatorHero } from '@/components/organisms/StudioCreatorHero/StudioCreatorHero';
import { StudioCreatorStory } from '@/components/organisms/StudioCreatorStory/StudioCreatorStory';
import { StudioCreatorWorks } from '@/components/organisms/StudioCreatorWorks/StudioCreatorWorks';
import { StudioCreatorFaculty } from '@/components/organisms/StudioCreatorFaculty/StudioCreatorFaculty';
import { StudioCreatorPackages } from '@/components/organisms/StudioCreatorPackages/StudioCreatorPackages';
import { StudioAcademyReviews } from '@/components/organisms/StudioAcademyReviews/StudioAcademyReviews';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import { studioProgramPage } from '@/lib/studio-program/selectors';
import { showsInstallmentMethods } from '@/lib/commerce/selectors';
import { creatorAssets } from '@/lib/studio-creator/assets';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import type { StudioCreatorTemplateProps } from './types';
import styles from './StudioCreatorTemplate.module.css';

export function StudioCreatorTemplate({
  program,
  content,
  enrollment,
  editorial,
  page,
}: StudioCreatorTemplateProps) {
  const { offering, presentation, works } = studioProgramPage(program, content, enrollment);
  return (
    <div className={styles.page} data-course-design="creator">
      <MarketingSlot page={page} id="hero" />
      <StudioCreatorHero
        page={page}
        program={program}
        offering={offering}
        presentation={presentation}
        showInstallments={showsInstallmentMethods(offering, enrollment)}
        editorial={editorial}
      />
      <StudioCreatorStory
        page={page}
        program={program}
        duration={offering?.duration ?? 'За програмою курсу'}
        editorial={editorial}
      />
      <MarketingSlot page={page} id="gallery" />
      <StudioCreatorWorks
        works={works}
        images={content.images}
        opening={editorial.worksOpening}
        devices={editorial.worksDevices}
      />
      <MarketingSlot page={page} id="faculty" />
      {editorial.faculty && <StudioCreatorFaculty instructors={editorial.faculty} />}
      <MarketingSlot page={page} id="reviews" />
      <StudioAcademyReviews variant="creator" page={page} />
      <MarketingSlot page={page} id="packages" />
      {offering?.packages.length ? (
        <StudioCreatorPackages program={program} offering={offering} enrollment={enrollment} />
      ) : null}
      <MarketingSlot page={page} id="inquiry" />
      <StudioInquirySection
        title="Залиште"
        hand="заявку"
        description={
          presentation.open
            ? 'Розкажемо про програму, пакети й допоможемо обрати свій формат навчання.'
            : 'Розкажемо про наступний набір, пакети й допоможемо обрати свій формат навчання.'
        }
        context={{
          programId: program.id,
          offeringId: offering?.id,
          title: program.title,
          source: 'consultation',
        }}
      />
      <MarketingSlot page={page} id="studio-banner" />
      <aside className={`${styles.studio} studio-dark`} aria-label="Фотостудія ProPhoto">
        <div className={`${styles.studioCopy} studio-wrap`}>
          <p className="studio-label studio-eyebrow">Фотостудія екосистеми</p>
          <StudioImage
            asset={studioAssets.menu.imgLogoStudio}
            alt="ProPhoto Studio"
            sizes="355px"
            fit="contain"
          />
          <a href={ecosystemDestinations.studioBooking} className="studio-button-outline">
            Забронювати зал<span aria-hidden="true">→</span>
          </a>
        </div>
        <StudioImage
          asset={creatorAssets.studio}
          alt="Світлий зал фотостудії ProPhoto"
          className={styles.studioPhoto}
          sizes="(max-width:760px) 100vw, 50vw"
          fit="cover"
        />
      </aside>
      <StudioMobileAction>
        <StudioCreatorAction program={program} offering={offering} presentation={presentation} />
      </StudioMobileAction>
    </div>
  );
}
