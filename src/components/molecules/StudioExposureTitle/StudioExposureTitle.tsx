'use client';
import { useStudioExposureTitle } from './hooks';
import { exposureTitlePhase, exposureWordTranslation } from './selectors';
import type { ExposureTitleStyle, StudioExposureTitleProps } from './types';
import styles from './StudioExposureTitle.module.css';

const words = ['важливо,', 'як', 'ви', 'це', 'робите'];

export function StudioExposureTitle({ progress, transition, ready }: StudioExposureTitleProps) {
  const { root, layout } = useStudioExposureTitle();
  const position = layout?.mobile ? transition : progress;
  const morphing = ready && !!layout?.eligible && !layout.reducedMotion && position > 0.5;
  const phase = exposureTitlePhase(morphing ? position : 0);
  const style: ExposureTitleStyle = { '--removed-opacity': phase.removedOpacity };
  return (
    <div
      className={styles.title}
      ref={root}
      style={style}
      data-title-morphing={morphing}
      data-title-ink={ready && transition >= 0.45}
    >
      <h2 id="exposure-title" className={styles.source}>
        <span className={styles.removed}>не</span>
        <span data-title-source-word>{words[0]}</span>{' '}
        <strong className={styles.removed}>на що ви знімаєте, важливо,</strong>{' '}
        {words.slice(1).map((word, index) => (
          <span key={word}>
            {index > 0 ? ' ' : null}
            <span data-title-source-word>{word}</span>
          </span>
        ))}
      </h2>
      <div className={styles.copies} aria-hidden="true">
        {words.map((word, index) => {
          const translation = layout
            ? exposureWordTranslation(layout.words[index], position)
            : { x: 0, y: 0 };
          return (
            <span
              className={styles.word}
              data-title-copy-word
              key={word}
              style={{ transform: `translate(${translation.x}px, ${translation.y}px)` }}
            >
              <span>{word}</span>
            </span>
          );
        })}
      </div>
      <div className={styles.target} data-title-target aria-hidden="true">
        <div>
          <span data-title-target-word>{words[0]}</span>
        </div>
        <div>
          {words.slice(1).map((word, index) => (
            <span key={word}>
              {index > 0 ? ' ' : null}
              <span data-title-target-word>{word}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
