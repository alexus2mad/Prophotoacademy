import { StudioRentalBanner } from '@/components/organisms/StudioRentalBanner/StudioRentalBanner';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
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
  const food = program.id === 'program-food';
  const gallery = (
    <>
      <MarketingSlot page={page} id="gallery" />
      <StudioCreatorWorks
        works={works}
        images={content.images}
        opening={editorial.worksOpening}
        devices={editorial.worksDevices}
        layout={food ? 'two-rows' : undefined}
        page={food ? page : undefined}
      />
    </>
  );
  return (
    <div className={styles.page} data-course-design="creator" data-food-course={food || undefined}>
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
        beforeCurriculum={food ? gallery : undefined}
      />
      {!food && gallery}
      <MarketingSlot page={page} id="faculty" />
      {editorial.faculty && <StudioCreatorFaculty instructors={editorial.faculty} />}
      <MarketingSlot page={page} id="reviews" />
      <StudioAcademyReviews variant={food ? 'food' : 'creator'} page={page} />
      <MarketingSlot page={page} id="packages" />
      {offering?.packages.length ? (
        <StudioCreatorPackages
          program={program}
          offering={offering}
          enrollment={enrollment}
          page={page}
        />
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
      <StudioRentalBanner />
      <StudioMobileAction>
        <StudioCreatorAction program={program} offering={offering} presentation={presentation} />
      </StudioMobileAction>
    </div>
  );
}
