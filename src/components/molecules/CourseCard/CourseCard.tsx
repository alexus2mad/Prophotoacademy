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
import type { CourseCardProps } from './types';
export function CourseCard({ program, offering, image }: CourseCardProps) {
  const price = startingPrice(offering);
  const status = offering ? offeringStatus(offering) : 'waitlist';
  const custom = ['individual', 'corporate'].includes(program.category);
  return (
    <article className="course-card">
      <Link href={`/${program.slug}`} className="course-link">
        <div className="course-card-heading">
          <p className="eyebrow">{audienceLabel(program)}</p>
          <h3>{program.shortTitle}</h3>
        </div>
        <div className="course-image">
          <Photo
            image={image}
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) 46vw, 30vw"
          />
          {!custom && (
            <span
              className={`badge ${status === 'limited' || status === 'open' ? 'badge-accent' : ''}`}
            >
              {programStatusLabel(program, offering)}
            </span>
          )}
        </div>
        <div className="course-body">
          <p className="course-meta">
            {offering ? formatLabel[offering.format] : 'За запитом'}
            {!custom && offering?.duration && (
              <>
                <span aria-hidden="true">·</span>
                {offering.duration}
              </>
            )}
          </p>
          <div className="course-bottom">
            {price !== undefined && (
              <span>
                <span className="muted">від </span>
                {money(price)}
              </span>
            )}
            <span className="course-action">Деталі програми</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
