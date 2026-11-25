import { DisclosurePackageCard } from '@/components/molecules/DisclosurePackageCard/DisclosurePackageCard';
import { foodInclusionEmphasis } from '@/lib/studio-food/emphasis';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { PackageIncludes } from '@/components/molecules/PackageIncludes/PackageIncludes';
import { EnrollmentScope } from '@/components/molecules/EnrollmentScope/EnrollmentScope';
import { InstallmentMethods } from '@/components/molecules/InstallmentMethods/InstallmentMethods';
import { canEnroll, isEnrollmentClosed, money } from '@/lib/format';
import { isProduct } from '@/lib/commerce/selectors';
import Link from 'next/link';
import type { PackageCardProps } from './types';
import styles from './PackageCard.module.css';
export function PackageCard({
  offering,
  program,
  pack,
  enrollable,
  paymentDisabled,
  showInstallments,
  availableLessons,
  layout = 'summary-first',
  summary,
}: PackageCardProps) {
  const closed = isEnrollmentClosed(offering, pack);
  const purchaseAvailable =
    !closed && !pack.inquiryOnly && (enrollable ?? canEnroll(offering, pack));
  const installments = purchaseAvailable && showInstallments && <InstallmentMethods />;
  const disclosure = layout === 'disclosure';
  const editorial = layout === 'editorial' || disclosure;
  const benefits = (
    <>
      {!pack.includes.length && !isProduct(pack) && (
        <p className="package-conditions-note">
          Уточніть обсяг навчання, підтримку, практику й строк доступу до вибору пакета.
        </p>
      )}
      {!!pack.includes.length && (
        <div className="package-includes-desktop">
          <PackageIncludes pack={pack} emphasis={disclosure ? foodInclusionEmphasis : undefined} />
        </div>
      )}
      {!!pack.includes.length && !editorial && (
        <details className="package-includes-mobile">
          <summary>Що входить у пакет</summary>
          <PackageIncludes pack={pack} />
        </details>
      )}
    </>
  );
  const price = (
    <div className="price" data-site-locked={disclosure ? '' : undefined}>
      {editorial ? (
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
  );
  const action = (
    <div className="package-action" data-site-locked={disclosure ? '' : undefined}>
      {!editorial && installments && <div className={styles.installments}>{installments}</div>}
      {purchaseAvailable ? (
        <Link
          href={`/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`}
          scroll={false}
          aria-haspopup="dialog"
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
  );
  if (disclosure) {
    return (
      <DisclosurePackageCard
        pack={pack}
        summary={summary ?? pack.description}
        price={price}
        action={action}
        benefits={benefits}
        installments={installments}
      />
    );
  }
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
      {price}
      {layout === 'editorial' && installments && (
        <div className={`${styles.installments} ${styles.underPrice}`}>{installments}</div>
      )}
      {layout === 'editorial' && <div className="package-benefits">{benefits}</div>}
      {action}
      {layout === 'summary-first' && (
        <>
          <p>{pack.description}</p>
          {benefits}
        </>
      )}
    </article>
  );
}
