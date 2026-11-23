import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { Fragment } from 'react';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import type { EditorialLandingProps } from './types';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import styles from './EditorialLandingTemplate.module.css';

export function EditorialLandingTemplate({ page }: EditorialLandingProps) {
  return (
    <>
      <article className={styles.page}>
        {page.sections
          .filter((section) => !section.blockType)
          .map((section) => {
            const values = Object.fromEntries(
              section.fields.map((field) => [field.id, field.value]),
            );
            const cover = section.id === 'landing-cover';
            const title = cover ? values.title || page.title : values.heading;
            const text = cover ? values.description : values.text;
            const slot = <MarketingSlot page={page} id={section.id} key={section.id} />;
            if (!title && !text && !values.image) return slot;
            return (
              <Fragment key={section.id}>
                {slot}
                <section data-site-section={section.id} className={styles.section}>
                  {title &&
                    (cover ? (
                      <h1 data-site-field="title">{title}</h1>
                    ) : (
                      <h2 data-site-field="heading">{title}</h2>
                    ))}
                  {text?.split(/\n\s*\n/).map((p, i) => (
                    <p key={i} data-site-paragraph={cover ? 'description' : 'text'}>
                      {p}
                    </p>
                  ))}
                  {cover && (page.kind === 'course' || page.kind === 'workshop') && (
                    <div className={styles.action} data-site-locked="">
                      <InquiryButton
                        className="studio-button"
                        title={title}
                        subject={page.kind === 'workshop' ? 'workshops' : 'program-selection'}
                      >
                        Дізнатися про участь
                      </InquiryButton>
                    </div>
                  )}
                  {values.image && (
                    <StudioImage
                      fieldId="image"
                      asset={{ src: values.image, width: 1600, height: 1000 }}
                      alt={values.alt || ''}
                      sizes="(max-width: 900px) 100vw, 900px"
                      preload={cover}
                    />
                  )}
                </section>
              </Fragment>
            );
          })}
      </article>
      <MarketingComposition page={page} />
    </>
  );
}
