import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import {
  creatorAudience,
  creatorBenefits,
  creatorLearningSteps,
} from '@/lib/studio-creator/content';
import { creatorAssets } from '@/lib/studio-creator/assets';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioCreatorStoryProps } from './types';
import styles from './StudioCreatorStory.module.css';

export function StudioCreatorStory({ program, duration }: StudioCreatorStoryProps) {
  return (
    <>
      <section
        id="program-audience"
        className="studio-light studio-band studio-wrap"
        aria-labelledby="creator-audience-title"
      >
        <StudioCreatorHeading id="creator-audience-title" label="Для кого">
          Цей курс <span className="studio-hand">*для</span>
        </StudioCreatorHeading>
        <ol className={styles.audience}>
          {creatorAudience.map((item, index) => (
            <li key={item.title}>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / 06
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section
        className="studio-dark studio-band studio-wrap"
        aria-labelledby="creator-benefits-title"
      >
        <StudioCreatorHeading id="creator-benefits-title">
          Чому <span className="studio-hand">*цей курс</span>
        </StudioCreatorHeading>
        <ul className={styles.benefits}>
          {creatorBenefits.map((item, index) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <span className={styles.connector} aria-hidden="true">
                <img src={studioAssetUrl(creatorAssets.connectors[index])} alt="" />
              </span>
              <img
                className={styles.arrow}
                src={studioAssetUrl('/images/studio/creator/connector-arrow-fc220646fe17.svg')}
                alt=""
              />
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section
        id="program-curriculum"
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
            {program.modules.map((module) => (
              <section key={module.title}>
                <h3>{module.title}</h3>
                <ul>
                  {module.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      </section>
      <section
        className={`${styles.format} studio-dark studio-band studio-wrap`}
        aria-labelledby="creator-format-title"
      >
        <StudioCreatorHeading id="creator-format-title" label="Формат">
          Як проходить <span className="studio-hand">*навчання</span>
        </StudioCreatorHeading>
        <ol className={styles.steps}>
          {creatorLearningSteps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
