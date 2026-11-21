'use client';
import { readField } from '@/lib/site-editor/fields';
import { homeWorks } from '@/lib/site-editor/brand/home/works';
import { bindSection } from '@/lib/site-editor/bind-section';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { StudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/StudioHomeCarousel';
import { ImageGalleryDialog } from '@/components/molecules/ImageGalleryDialog/ImageGalleryDialog';
import { useStudioHomeWorks } from './hooks';
import type { StudioHomeWorksProps } from './types';
import styles from './StudioHomeWorks.module.css';

const photosPerPage = 4;

export function StudioHomeWorks({ page, works: originals }: StudioHomeWorksProps) {
  const { text, image } = bindSection(page, homeWorks);
  const works = originals.map((work) => ({
    ...work,
    image: image(work.id + '-image', work.image),
    mobileImage: work.mobileImage && image(work.id + '-mobile-image', work.mobileImage),
    alt: readField(page, 'works', work.id + '-image-alt', work.alt),
  }));
  const { carousel, gallery, images } = useStudioHomeWorks({ works }, photosPerPage);
  const { rail, active, maximum, select, onKeyDown } = carousel;
  const pages = Array.from({ length: Math.ceil(works.length / photosPerPage) }, (_, index) =>
    works.slice(index * photosPerPage, (index + 1) * photosPerPage),
  );
  return (
    <section
      className={styles.works}
      data-home-section="works"
      data-site-section="works"
      aria-labelledby="home-works-title"
    >
      <div className={`${styles.heading} studio-wrap`}>
        <h2 className="studio-title" id="home-works-title">
          {text('title')} <span className="studio-hand">{text('emphasis')}</span>
        </h2>
        <Link href={studioAcademyDestinations.courses} className="studio-button-outline">
          {text('action')}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div
        className={styles.rail}
        data-inline-gallery={works.length > 2 ? 'scroll' : ''}
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
            data-inline-gallery-group
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
                onClick={() => gallery.open(index * photosPerPage + photoIndex)}
              >
                <StudioHomePicture
                  fieldId={work.id + '-image'}
                  mobileFieldId={work.id + '-mobile-image'}
                  image={work.image}
                  mobileImage={work.mobileImage}
                  alt={work.alt}
                  sizes="(max-width: 760px) 40vw, 25vw"
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
        label={text('gallery-name')}
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
