import Link from 'next/link';
import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import type { AcademyDirectionCardProps } from './types';
export function AcademyDirectionCard({ direction }: AcademyDirectionCardProps) {
  return (
    <article className="academy-direction" data-card-motion>
      <div className="academy-direction-photo" data-card-photo>
        <PreparedPhoto
          image={direction.image}
          sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33.333vw"
        />
      </div>
      <div className="academy-direction-copy">
        <h3>
          {direction.href ? (
            <Link href={direction.href}>
              <span className="academy-direction-title" data-card-title>
                {direction.title}
              </span>
            </Link>
          ) : (
            <InquiryButton className="academy-direction-action" title={direction.inquiryTitle}>
              <span className="academy-direction-title" data-card-title>
                {direction.title}
              </span>
            </InquiryButton>
          )}
        </h3>
        <p>{direction.subtitle}</p>
      </div>
    </article>
  );
}
