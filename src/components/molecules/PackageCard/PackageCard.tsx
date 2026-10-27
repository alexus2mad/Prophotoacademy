import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { PackageIncludes } from '@/components/molecules/PackageIncludes/PackageIncludes';
import { EnrollmentScope } from '@/components/molecules/EnrollmentScope/EnrollmentScope';
import { canEnroll, money } from '@/lib/format';
import { isProduct } from '@/lib/commerce/selectors';
import Link from 'next/link';
import type { PackageCardProps } from './types';
export function PackageCard({
  offering,
  program,
  pack,
  enrollable,
  paymentDisabled,
  availableLessons,
}: PackageCardProps) {
  return (
    <article
      key={pack.id}
      className="package-card"
      data-featured={pack.featured || undefined}
      data-unavailable={pack.availability === 'soldOut'}
    >
      <div className="package-header">
        <h3>{pack.name}</h3>
        {pack.featured && <span className="package-popularity">Найпопулярніший</span>}
      </div>
      <div className="price">
        {money(pack.price)}
        {pack.previousPrice !== undefined && pack.previousPrice > pack.price && (
          <span className="previous-price">{money(pack.previousPrice)}</span>
        )}
      </div>
      <div className="package-action">
        {!pack.inquiryOnly && (enrollable ?? canEnroll(offering, pack)) ? (
          <Link
            href={`/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`}
            className={`button button-wide${pack.featured ? '' : ' button-secondary'}`}
          >
            {paymentDisabled
              ? 'Отримати доступ'
              : isProduct(pack)
                ? 'Придбати'
                : `Обрати ${pack.name}`}
          </Link>
        ) : pack.availability === 'soldOut' ? (
          <span className="package-status">Місць немає</span>
        ) : (
          <InquiryButton
            programId={program.id}
            offeringId={offering.id}
            packageId={pack.id}
            title={`${program.shortTitle}: ${pack.name}`}
            className={`button button-wide${pack.featured ? '' : ' button-secondary'}`}
          >
            Уточнити пакет
          </InquiryButton>
        )}
        {!pack.inquiryOnly && paymentDisabled && enrollable && availableLessons && (
          <EnrollmentScope lessons={availableLessons} />
        )}
      </div>
      <p>{pack.description}</p>
      {!!pack.includes.length && (
        <div className="package-includes-desktop">
          <PackageIncludes pack={pack} />
        </div>
      )}
      {!!pack.includes.length && (
        <details className="package-includes-mobile">
          <summary>Що входить у пакет</summary>
          <PackageIncludes pack={pack} />
        </details>
      )}
    </article>
  );
}
