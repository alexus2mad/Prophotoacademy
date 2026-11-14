import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { PackageIncludes } from '@/components/molecules/PackageIncludes/PackageIncludes';
import { EnrollmentScope } from '@/components/molecules/EnrollmentScope/EnrollmentScope';
import { canEnroll, isEnrollmentClosed, money } from '@/lib/format';
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
  layout = 'summary-first',
}: PackageCardProps) {
  const closed = isEnrollmentClosed(offering, pack);
  const benefits = (
    <>
      {!pack.includes.length && !isProduct(pack) && (
        <p className="package-conditions-note">
          Уточніть обсяг навчання, підтримку, практику й строк доступу до вибору пакета.
        </p>
      )}
      {!!pack.includes.length && (
        <div className="package-includes-desktop">
          <PackageIncludes pack={pack} />
        </div>
      )}
      {!!pack.includes.length && layout !== 'editorial' && (
        <details className="package-includes-mobile">
          <summary>Що входить у пакет</summary>
          <PackageIncludes pack={pack} />
        </details>
      )}
    </>
  );
  return (
    <article
      key={pack.id}
      className="package-card"
      data-layout={layout === 'editorial' ? layout : undefined}
      data-featured={pack.featured || undefined}
      data-unavailable={pack.availability === 'soldOut'}
    >
      <div className="package-header">
        <h3>{pack.name}</h3>
        {pack.featured && <span className="package-popularity">Найпопулярніший</span>}
      </div>
      {(layout === 'benefits-first' || layout === 'editorial') && <p>{pack.description}</p>}
      {layout === 'benefits-first' && benefits}
      <div className="price">
        {layout === 'editorial' ? (
          <>
            <span className="price-amount">
              {money(pack.price)
                .replace(/\s*₴$/, '')
                .replace(/\u00a0/g, ' ')}
            </span>
            <span className="price-currency">грн</span>
          </>
        ) : (
          money(pack.price)
        )}
        {pack.previousPrice !== undefined && pack.previousPrice > pack.price && (
          <span className="previous-price">{money(pack.previousPrice)}</span>
        )}
      </div>
      {layout === 'editorial' && <div className="package-benefits">{benefits}</div>}
      <div className="package-action">
        {!closed && !pack.inquiryOnly && (enrollable ?? canEnroll(offering, pack)) ? (
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
            title={
              closed
                ? `${program.shortTitle}: наступний набір, ${pack.name}`
                : `${program.shortTitle}: ${pack.name}`
            }
            className={`button button-wide${pack.featured ? '' : ' button-secondary'}`}
          >
            {closed ? 'Наступний набір' : 'Уточнити пакет'}
          </InquiryButton>
        )}
        {!closed && !pack.inquiryOnly && paymentDisabled && enrollable && availableLessons && (
          <EnrollmentScope lessons={availableLessons} />
        )}
      </div>
      {layout === 'summary-first' && (
        <>
          <p>{pack.description}</p>
          {benefits}
        </>
      )}
    </article>
  );
}
