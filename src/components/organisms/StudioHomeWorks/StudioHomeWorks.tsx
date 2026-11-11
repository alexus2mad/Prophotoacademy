'use client';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { StudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/StudioHomeCarousel';
import { ImageGalleryDialog } from '@/components/molecules/ImageGalleryDialog/ImageGalleryDialog';
import { useStudioHomeWorks } from './hooks';
import type { StudioHomeWorksProps } from './types';
import styles from './StudioHomeWorks.module.css';

export function StudioHomeWorks({ works }: StudioHomeWorksProps) {
  const { carousel, gallery, images } = useStudioHomeWorks({ works });
  const { rail, active, maximum, select, onKeyDown } = carousel;
  const pages = Array.from({ length: Math.ceil(works.length / 4) }, (_, index) =>
    works.slice(index * 4, index * 4 + 4),
  );
  return (
    <section className={styles.works} data-home-section="works" aria-labelledby="home-works-title">
      <div className={`${styles.heading} studio-wrap`}>
        <h2 className="studio-title" id="home-works-title">
          Роботи <span className="studio-hand">*студентів</span>
        </h2>
        <Link href={studioAcademyDestinations.courses} className="studio-button-outline">
          Хочу так само<span aria-hidden="true">→</span>
        </Link>
      </div>
      <div
        className={styles.rail}
        ref={rail}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="region"
        aria-roledescription="карусель"
        aria-label="Роботи студентів"
      >
        {pages.map((page, index) => (
          <div
            className={styles.page}
            key={page[0].id}
            role="group"
            aria-label={`${index + 1} з ${pages.length}`}
          >
            {page.map((work, photoIndex) => (
              <button
                type="button"
                key={work.id}
                className={styles.image}
                aria-label={`Відкрити роботу: ${work.alt}`}
                aria-haspopup="dialog"
                onClick={() => gallery.open(index * 4 + photoIndex)}
              >
                <StudioHomePicture
                  image={work.image}
                  mobileImage={work.mobileImage}
                  alt={work.alt}
                  sizes="(max-width: 760px) 48vw, 25vw"
                />
              </button>
            ))}
          </div>
        ))}
      </div>
      <StudioHomeCarousel
        count={pages.length}
        active={active}
        previousDisabled={active === 0}
        nextDisabled={active >= maximum}
        onSelect={select}
        label="Роботи студентів"
      />
      <ImageGalleryDialog
        images={images}
        dialogRef={gallery.dialog}
        index={gallery.index}
        onNavigate={gallery.move}
      />
    </section>
  );
}
