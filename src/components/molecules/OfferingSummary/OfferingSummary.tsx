import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { programSchedule } from '@/lib/program-schedule';
import type { OfferingSummaryProps } from './types';
import styles from './OfferingSummary.module.css';

export function OfferingSummary({
  program,
  offering,
  packageId,
  packageName,
}: OfferingSummaryProps) {
  const schedule = programSchedule(program, offering);
  return (
    <div className={styles.summary}>
      <p>
        <strong>{schedule.status}</strong>
        {' · '}
        {schedule.label}:{' '}
        {schedule.date ? <time dateTime={schedule.date}>{schedule.value}</time> : schedule.value}
      </p>
      {schedule.explanation && <p>{schedule.explanation}</p>}
      {schedule.inquirySuggested && (
        <InquiryButton
          programId={program.id}
          offeringId={offering.id}
          packageId={packageId}
          title={packageName ? `${program.shortTitle}: ${packageName}` : program.shortTitle}
          className="text-link"
        >
          Уточнити умови навчання
        </InquiryButton>
      )}
    </div>
  );
}
