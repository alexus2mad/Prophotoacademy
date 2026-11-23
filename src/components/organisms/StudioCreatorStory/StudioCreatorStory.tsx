import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import { creatorCurriculumId } from '@/lib/studio-creator/content';
import { creatorAssets } from '@/lib/studio-creator/assets';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioCreatorStoryProps } from './types';
import styles from './StudioCreatorStory.module.css';

export function StudioCreatorStory({
  program,
  duration,
  editorial,
  page,
}: StudioCreatorStoryProps) {
  const { audience, benefits, learningSteps } = editorial;
  const audienceTotal = String(audience.length).padStart(2, '0');
  const connectors = creatorAssets.connectors;
  return (
    <>
      <MarketingSlot page={page} id="audience" />
      <section
        id="program-audience"
        data-site-section="audience"
        className="studio-light studio-band studio-wrap"
        aria-labelledby="creator-audience-title"
      >
        <StudioCreatorHeading id="creator-audience-title" label="Для кого">
          Цей курс <span className="studio-hand">*для</span>
        </StudioCreatorHeading>
        <ol className={styles.audience}>
          {audience.map((item, index) => (
            <li key={item.title}>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / {audienceTotal}
              </span>
              <h3 data-site-field={'title-' + index}>{item.title}</h3>
              <p data-site-field={'text-' + index}>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <MarketingSlot page={page} id="benefits" />
      <section
        className="studio-dark studio-band studio-wrap"
        aria-labelledby="creator-benefits-title"
        data-site-section="benefits"
      >
        <StudioCreatorHeading id="creator-benefits-title">
          Чому <span className="studio-hand">*цей курс</span>
        </StudioCreatorHeading>
        <ul className={styles.benefits}>
          {benefits.map((item, index) => (
            <li key={item.title}>
              <h3 data-site-field={'title-' + index}>{item.title}</h3>
              <span className={styles.connector} aria-hidden="true">
                <span
                  className={styles.shaft}
                  style={{
                    backgroundImage: `url("${studioAssetUrl(connectors[index % connectors.length])}")`,
                  }}
                />
                <img
                  className={styles.arrow}
                  src={studioAssetUrl(creatorAssets.connectorArrow)}
                  width={8}
                  height={14}
                  alt=""
                />
              </span>
              <p data-site-field={'text-' + index}>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <MarketingSlot page={page} id="curriculum" />
      <section
        id={creatorCurriculumId}
        data-site-section="curriculum"
        className="studio-light studio-band studio-wrap"
        aria-labelledby="creator-curriculum-title"
      >
        <StudioCreatorHeading id="creator-curriculum-title" label={`Програма · ${duration}`}>
          Що ви <span className="studio-hand">*опануєте</span>
        </StudioCreatorHeading>
        <details className={styles.curriculum}>
          <summary>
            Ознайомитись з програмою
            <span aria-hidden="true" />
          </summary>
          <div className={styles.modules}>
            {program.modules.map((module, index) => (
              <section key={module.title}>
                <h3 data-site-field={'module-' + index}>{module.title}</h3>
                <ul>
                  {module.topics.map((topic, topicIndex) => (
                    <li key={topic} data-site-field={`topic-${index}-${topicIndex}`}>
                      {topic}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      </section>
      <MarketingSlot page={page} id="steps" />
      <section
        className={`${styles.format} studio-dark studio-band studio-wrap`}
        aria-labelledby="creator-format-title"
        data-site-section="steps"
      >
        <StudioCreatorHeading id="creator-format-title" label="Формат">
          Як проходить <span className="studio-hand">*навчання</span>
        </StudioCreatorHeading>
        <ol className={styles.steps}>
          {learningSteps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 data-site-field={'title-' + index}>{step.title}</h3>
              <p data-site-field={'text-' + index}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
