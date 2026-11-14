'use client';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import { ImageGalleryDialog } from '@/components/molecules/ImageGalleryDialog/ImageGalleryDialog';
import { useCreatorWorks } from './hooks';
import type { StudioCreatorWorksProps } from './types';
import styles from './StudioCreatorWorks.module.css';

export function StudioCreatorWorks(props: StudioCreatorWorksProps) {
  const { device, selectDevice, entries, carousel, gallery } = useCreatorWorks(props);
  return (
    <section
      id="student-works"
      className={`${styles.section} studio-dark studio-band studio-wrap`}
      aria-labelledby="creator-works-title"
    >
      <StudioCreatorHeading id="creator-works-title">
        Роботи <span className="studio-hand">*студентів</span>
      </StudioCreatorHeading>
      <p className={styles.description}>
        Кожна робота — шлях від «як налаштувати камеру» до розуміння композиції, світла, кольору й
        ідеї зйомки.
      </p>
      <div className={styles.filters} role="group" aria-label="Техніка зйомки">
        <button
          type="button"
          aria-pressed={device === 'camera'}
          aria-controls="creator-work-rail"
          onClick={() => selectDevice('camera')}
        >
          На камеру
        </button>
        <button
          type="button"
          aria-pressed={device === 'phone'}
          aria-controls="creator-work-rail"
          onClick={() => selectDevice('phone')}
        >
          На телефон
        </button>
      </div>
      <div
        id="creator-work-rail"
        className={styles.rail}
        ref={carousel.track}
        tabIndex={0}
        role="region"
        aria-label={device === 'camera' ? 'Роботи на камеру' : 'Роботи на телефон'}
        onKeyDown={carousel.onKeyDown}
      >
        {entries.map((work, index) => (
          <button
            type="button"
            key={work.id}
            className={styles.work}
            data-partial={work.partial || undefined}
            onClick={() => gallery.open(index)}
            aria-label={`Відкрити роботу: ${work.alt}`}
            aria-haspopup="dialog"
          >
            <StudioImage
              asset={work}
              alt={work.alt}
              sizes="(max-width: 760px) 80vw, 28vw"
              fit="cover"
            />
          </button>
        ))}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Попередня робота"
          disabled={carousel.position.start}
          onClick={() => carousel.move(-1)}
        >
          ←
        </button>
        <span aria-live="polite">
          {carousel.position.index} / {entries.length}
        </span>
        <button
          type="button"
          aria-label="Наступна робота"
          disabled={carousel.position.end}
          onClick={() => carousel.move(1)}
        >
          →
        </button>
      </div>
      <ImageGalleryDialog
        images={entries}
        dialogRef={gallery.dialog}
        index={gallery.index}
        onNavigate={gallery.move}
      />
    </section>
  );
}
