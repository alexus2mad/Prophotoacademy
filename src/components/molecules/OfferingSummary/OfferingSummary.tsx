import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { programSchedule } from '@/lib/program-schedule';
import { isEnrollmentClosed } from '@/lib/format';
import type { OfferingSummaryProps } from './types';
import styles from './OfferingSummary.module.css';

export function OfferingSummary({
  program,
  offering,
  packageId,
  packageName,
}: OfferingSummaryProps) {
  const schedule = programSchedule(program, offering);
  const closed = isEnrollmentClosed(offering);
  return (
    <div className={styles.summary}>
      <p>
        <strong>{schedule.status}</strong>
        {' · '}
        {schedule.label}:{' '}
        {schedule.date ? <time dateTime={schedule.date}>{schedule.value}</time> : schedule.value}
        {schedule.time && <> · {schedule.time}</>}
      </p>
      {schedule.explanation && <p>{schedule.explanation}</p>}
      {schedule.inquirySuggested && (
        <InquiryButton
          programId={program.id}
          offeringId={offering.id}
          packageId={packageId}
          title={
            closed
              ? `${program.shortTitle}: наступний набір`
              : packageName
                ? `${program.shortTitle}: ${packageName}`
                : program.shortTitle
          }
          className="text-link"
        >
          {closed ? 'Повідомити про наступний набір' : 'Уточнити умови навчання'}
        </InquiryButton>
      )}
    </div>
  );
}
