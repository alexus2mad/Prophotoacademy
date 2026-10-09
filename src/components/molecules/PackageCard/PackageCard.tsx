import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { PackageIncludes } from '@/components/molecules/PackageIncludes/PackageIncludes';
import { canEnroll, money } from '@/lib/format';
import Link from 'next/link';
import type { PackageCardProps } from './types';
export function PackageCard({ offering, program, pack }: PackageCardProps) {
  return (
    <article
      key={pack.id}
      className="package-card"
      data-unavailable={pack.availability === 'soldOut'}
    >
      <div className="package-header">
        <h3>{pack.name}</h3>
        {pack.availability === 'soldOut' && <span className="package-status">Місць немає</span>}
      </div>
      <div className="price">
        {money(pack.price)}
        {pack.previousPrice && <span className="previous-price">{money(pack.previousPrice)}</span>}
      </div>
      <p>{pack.description}</p>
      <div className="package-includes-desktop">
        <PackageIncludes pack={pack} />
      </div>
      {!!pack.includes.length && (
        <details className="package-includes-mobile">
          <summary>Що входить у пакет</summary>
          <PackageIncludes pack={pack} />
        </details>
      )}
      <div className="package-action">
        {canEnroll(offering, pack) ? (
          <Link
            href={`/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`}
            className="button button-wide"
          >
            Обрати {pack.name}
          </Link>
        ) : pack.availability === 'soldOut' ? null : (
          <InquiryButton
            programId={program.id}
            offeringId={offering.id}
            packageId={pack.id}
            title={`${program.shortTitle}: ${pack.name}`}
            className="button button-secondary button-wide"
          >
            Уточнити пакет
          </InquiryButton>
        )}
      </div>
    </article>
  );
}
