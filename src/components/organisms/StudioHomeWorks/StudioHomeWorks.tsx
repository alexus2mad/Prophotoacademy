'use client';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { StudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/StudioHomeCarousel';
import { useStudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/hooks';
import type { StudioHomeWorksProps } from './types';
import styles from './StudioHomeWorks.module.css';

export function StudioHomeWorks({ works }: StudioHomeWorksProps) {
  const { rail, active, maximum, select, onKeyDown } = useStudioHomeCarousel();
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
            {page.map((work) => (
              <StudioHomePicture
                key={work.id}
                image={work.image}
                mobileImage={work.mobileImage}
                alt={work.alt}
                className={styles.image}
                sizes="(max-width: 760px) 48vw, 25vw"
              />
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
    </section>
  );
}
