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
    <article className="course-card" data-card-motion>
      <Link href={`/${program.slug}`} className="course-link">
        <div className="course-card-heading">
          <p className="eyebrow">{audienceLabel(program)}</p>
          <h3>
            <span data-card-title>{program.shortTitle}</span>
          </h3>
        </div>
        <div className="course-image" data-card-photo>
          <Photo
            image={image}
            sizes="(max-width: 599px) calc(100vw - 40px), (max-width: 1023px) 44vw, 30vw"
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
