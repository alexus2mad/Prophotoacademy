'use client';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { bindSection } from '@/lib/site-editor/bind-section';
import { studentWorksHeading } from '@/lib/site-editor/brand/student-works';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import { ImageGalleryDialog } from '@/components/molecules/ImageGalleryDialog/ImageGalleryDialog';
import { useCreatorWorks } from './hooks';
import type { StudioCreatorWorksProps } from './types';
import styles from './StudioCreatorWorks.module.css';

const deviceLabels = { camera: 'На камеру', phone: 'На телефон' } as const;

export function StudioCreatorWorks(props: StudioCreatorWorksProps) {
  const { devices, device, selectDevice, entries, carousel, gallery } = useCreatorWorks(props);
  const twoRows = props.layout === 'two-rows';
  const { text } = bindSection(props.page, studentWorksHeading);
  return (
    <section
      id="student-works"
      className={`${styles.section} studio-dark studio-band studio-wrap`}
      aria-labelledby="creator-works-title"
      data-site-section={twoRows ? studentWorksHeading.id : undefined}
    >
      <StudioCreatorHeading id="creator-works-title">
        {twoRows ? <SiteCopy id="title">{text('title')}</SiteCopy> : text('title')}{' '}
        <span className="studio-hand" data-site-field={twoRows ? 'accent' : undefined}>
          {text('accent')}
        </span>
      </StudioCreatorHeading>
      <p className={styles.description} data-site-field={twoRows ? 'description' : undefined}>
        {text('description')}
      </p>
      {devices.length > 1 && (
        <div className={styles.filters} role="group" aria-label="Техніка зйомки">
          {devices.map((option) => (
            <button
              type="button"
              key={option}
              aria-pressed={device === option}
              aria-controls="creator-work-rail"
              onClick={() => selectDevice(option)}
            >
              {deviceLabels[option]}
            </button>
          ))}
        </div>
      )}
      <div
        id="creator-work-rail"
        className={twoRows ? `${styles.rail} ${styles.twoRows}` : styles.rail}
        data-inline-gallery={twoRows ? undefined : entries.length > 2 ? 'scroll' : ''}
        ref={carousel.track}
        tabIndex={0}
        role="region"
        aria-label={
          twoRows
            ? 'Роботи студентів курсу'
            : device === 'camera'
              ? 'Роботи на камеру'
              : 'Роботи на телефон'
        }
        onKeyDown={carousel.onKeyDown}
      >
        {entries.map((work, index) => (
          <button
            type="button"
            key={work.id}
            data-site-section={work.imageId ? 'gallery' : 'featured-' + work.id}
            className={styles.work}
            onClick={() => gallery.open(index)}
            aria-label={`Відкрити роботу: ${work.alt}`}
            aria-haspopup="dialog"
          >
            <StudioImage
              asset={work}
              fieldId={work.imageId ?? 'image'}
              alt={work.alt}
              fit={work.preserveFraming ? 'contain' : undefined}
              position={work.position}
              sizes="(max-width: 760px) 40vw, 28vw"
            />
          </button>
        ))}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Попередня робота"
          aria-controls="creator-work-rail"
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
          aria-controls="creator-work-rail"
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
