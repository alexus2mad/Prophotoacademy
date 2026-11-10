import { studioIntensiveBlocks } from '@/lib/studio-pages/intensive';
import styles from './StudioIntensiveProgram.module.css';

export function StudioIntensiveProgram() {
  return (
    <section id="intensive-program" className="studio-band studio-light">
      <div className="studio-wrap">
        <header className={styles.head}>
          <p className="studio-label studio-eyebrow">Програма · 4–5 годин</p>
          <h2 className="studio-title">
            Як проходить <span className="studio-hand">*інтенсив</span>
          </h2>
        </header>
        <div className={styles.blocks}>
          {studioIntensiveBlocks.map((block, index) => (
            <details className={styles.block} key={block.title} open={index === 0}>
              <summary>
                <span className={styles.number}>Блок {index + 1}</span>
                <h3>{block.title}</h3>
                <span className={styles.duration}>{block.duration}</span>
                <span className={styles.toggle} aria-hidden="true" />
              </summary>
              <div className={styles.body}>
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>
                    <strong>{paragraph.slice(0, paragraph.indexOf('.') + 1)}</strong>
                    {paragraph.slice(paragraph.indexOf('.') + 1)}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
