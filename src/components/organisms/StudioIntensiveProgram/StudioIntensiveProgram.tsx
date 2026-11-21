import { artworkCurriculum } from '@/lib/site-editor/brand/artwork/curriculum';
import { bindSection } from '@/lib/site-editor/bind-section';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import { studioIntensiveBlocks } from '@/lib/studio-pages/intensive';
import styles from './StudioIntensiveProgram.module.css';

export function StudioIntensiveProgram({ page }: BrandContentProps = {}) {
  const { text } = bindSection(page, artworkCurriculum);
  return (
    <section id="intensive-program" className="studio-band studio-light">
      <div className="studio-wrap">
        <header className={styles.head}>
          <p className="studio-label studio-eyebrow">{text('eyebrow')}</p>
          <h2 className="studio-title">
            {text('title')} <span className="studio-hand">{text('emphasis')}</span>
          </h2>
        </header>
        <div className={styles.blocks}>
          {studioIntensiveBlocks.map((block, index) => (
            <details className={styles.block} key={block.title} open={index === 0}>
              <summary>
                <span className={styles.number}>
                  {text('block-label')} {index + 1}
                </span>
                <h3>{text('block-' + index + '-title')}</h3>
                <span className={styles.duration}>{text('block-' + index + '-duration')}</span>
                <span className={styles.toggle} aria-hidden="true" />
              </summary>
              <div className={styles.body}>
                {block.paragraphs.map((_, i) => {
                  const paragraph = text('block-' + index + '-paragraph-' + i);
                  return (
                    <p key={i}>
                      <strong>{paragraph.slice(0, paragraph.indexOf('.') + 1)}</strong>
                      {paragraph.slice(paragraph.indexOf('.') + 1)}
                    </p>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
