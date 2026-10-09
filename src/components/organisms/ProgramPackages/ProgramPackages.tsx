import { PackageCard } from '@/components/molecules/PackageCard/PackageCard';
import { PackageComparison } from '@/components/organisms/PackageComparison/PackageComparison';
import { canEnroll } from '@/lib/format';
import type { ProgramPackagesProps } from './types';
export function ProgramPackages({ offering, program }: ProgramPackagesProps) {
  const open = canEnroll(offering);
  const compared = offering.packages.map((pack) => ({
    ...pack,
    statusLabel:
      pack.availability === 'soldOut'
        ? 'Місць немає'
        : canEnroll(offering, pack)
          ? 'Доступний'
          : 'Уточнюємо набір',
    purchaseUrl: canEnroll(offering, pack)
      ? `/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`
      : undefined,
    inquiryAllowed: pack.availability !== 'soldOut',
  }));
  return (
    <section className="program-packages" id="packages" aria-labelledby="packages-title">
      <div className="section-heading">
        <h2 id="packages-title">Пакети й вартість</h2>
        {compared.length > 1 && (
          <PackageComparison
            packages={compared}
            programId={program.id}
            offeringId={offering.id}
            programTitle={program.shortTitle}
          />
        )}
      </div>
      {!open && (
        <p className="package-source-note">
          Актуальну вартість і місця підтвердить команда перед записом.
        </p>
      )}
      <div className="package-grid">
        {offering.packages.map((pack) => (
          <PackageCard key={pack.id} pack={pack} offering={offering} program={program} />
        ))}
      </div>
    </section>
  );
}
