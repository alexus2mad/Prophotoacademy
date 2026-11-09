import Link from 'next/link';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { money, startingPrice } from '@/lib/format';
import { programSchedule } from '@/lib/program-schedule';
import type { StudioAcademyProgramRowProps } from './types';
import styles from './StudioAcademyProgramRow.module.css';

export function StudioAcademyProgramRow({
  program,
  offering,
  asset,
  asOf,
  heading: Heading = 'h3',
}: StudioAcademyProgramRowProps) {
  const price = startingPrice(offering);
  const schedule = programSchedule(program, offering, asOf ? new Date(asOf) : undefined);
  return (
    <Link href={`/${program.slug}`} className={styles.course}>
      {asset && (
        <StudioImage asset={asset} alt="" className={styles.photo} fit="cover" sizes="128px" />
      )}
      <div className={styles.copy}>
        <Heading>{program.title}</Heading>
        <p>{program.homepageDescription || program.description}</p>
        <p className={styles.schedule}>
          {schedule.value}
          {price !== undefined && <> · від {money(price)}</>}
        </p>
      </div>
      <span className={styles.status}>{schedule.status}</span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
