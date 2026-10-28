import { Photo } from '@/components/atoms/Photo/Photo';
import {
  audienceLabel,
  formatLabel,
  money,
  offeringStatus,
  programStatusLabel,
  startingPrice,
} from '@/lib/format';
import Link from 'next/link';
import { programSchedule } from '@/lib/program-schedule';
import type { CourseCardProps } from './types';
export function CourseCard({ program, offering, image }: CourseCardProps) {
  const price = startingPrice(offering);
  const status = offering ? offeringStatus(offering) : 'waitlist';
  const custom = ['individual', 'corporate'].includes(program.category);
  const schedule = programSchedule(program, offering);
  const archived = status === 'archived';
  const titleId = `${program.id}-title`;
  const scheduleId = `${program.id}-schedule`;
  const priceId = `${program.id}-price`;
  return (
    <article className="course-card" data-card-motion data-archived={archived || undefined}>
      <Link
        href={`/${program.slug}`}
        className="course-link"
        aria-labelledby={titleId}
        aria-describedby={`${scheduleId} ${priceId}`}
      >
        <div className="course-card-heading">
          <p className="eyebrow">{audienceLabel(program)}</p>
          <h2 id={titleId}>
            <span data-card-title>{program.shortTitle}</span>
          </h2>
        </div>
        <div className="course-image" data-card-photo>
          <Photo image={image} sizes="(max-width: 599px) 96px, (max-width: 1023px) 144px, 224px" />
        </div>
        <p className="course-description">{program.description}</p>
        <p className="course-meta">
          <span>{offering ? formatLabel[offering.format] : 'За запитом'}</span>
          {!custom && offering?.duration && <span>{offering.duration}</span>}
          {!custom && !archived && <span>{programStatusLabel(program, offering)}</span>}
        </p>
        <p className="course-schedule" id={scheduleId}>
          <span>{schedule.label}</span>
          {schedule.date ? (
            <time dateTime={schedule.date}>{schedule.value}</time>
          ) : (
            <strong>{schedule.value}</strong>
          )}
        </p>
        <p className="course-price" id={priceId}>
          {archived ? (
            <span className="course-price-note">Подія завершена</span>
          ) : price !== undefined ? (
            <>
              <span>від</span> <strong>{money(price)}</strong>
            </>
          ) : (
            <span className="course-price-note">Вартість за запитом</span>
          )}
        </p>
        <span className={`course-action button${custom || archived ? ' button-secondary' : ''}`}>
          {archived ? 'Переглянути подію' : custom ? 'Деталі навчання' : 'Програма та пакети'}
        </span>
      </Link>
    </article>
  );
}
