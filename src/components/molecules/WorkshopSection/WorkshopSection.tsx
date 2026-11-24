import { WorkshopAnnouncement } from '@/components/molecules/WorkshopAnnouncement/WorkshopAnnouncement';
import { WorkshopIntro } from '@/components/molecules/WorkshopIntro/WorkshopIntro';
import { WorkshopProgram } from '@/components/molecules/WorkshopProgram/WorkshopProgram';
import { WorkshopGallery } from '@/components/molecules/WorkshopGallery/WorkshopGallery';
import { WorkshopFormat } from '@/components/molecules/WorkshopFormat/WorkshopFormat';
import { WorkshopOffer } from '@/components/molecules/WorkshopOffer/WorkshopOffer';
import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import styles from './WorkshopSection.module.css';

const layouts = {
  'intensive-announcement': { Component: WorkshopAnnouncement, tone: 'dark' },
  'intensive-intro': { Component: WorkshopIntro, tone: 'dark' },
  'intensive-program': { Component: WorkshopProgram, tone: 'light' },
  'intensive-gallery': { Component: WorkshopGallery, tone: 'dark' },
  'intensive-format': { Component: WorkshopFormat, tone: 'dark' },
  'intensive-offer': { Component: WorkshopOffer, tone: 'light' },
} as const;

export function WorkshopSection(props: MarketingBlockProps) {
  const { id, blockType } = props.section;
  if (!blockType || !(blockType in layouts)) return null;
  const { Component, tone } = layouts[blockType as keyof typeof layouts];
  return (
    <section
      id={id}
      data-site-section={id}
      data-block-type={blockType}
      data-header-tone={tone}
      aria-labelledby={id + '-title'}
      className={`${styles.section} studio-${tone} studio-band studio-wrap`}
    >
      <Component {...props} />
    </section>
  );
}
