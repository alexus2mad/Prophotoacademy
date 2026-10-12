import { PackageCard } from '@/components/molecules/PackageCard/PackageCard';
import { PackageComparison } from '@/components/organisms/PackageComparison/PackageComparison';
import { canEnroll } from '@/lib/format';
import type { ProgramPackagesProps } from './types';
export function ProgramPackages({ offering, program, enrollment }: ProgramPackagesProps) {
  const available = (id: string) =>
    enrollment
      ? enrollment.packageIds.includes(id)
      : canEnroll(
          offering,
          offering.packages.find((p) => p.id === id),
        );
  const open = offering.packages.some((p) => available(p.id));
  const compared = offering.packages.map((pack) => ({
    ...pack,
    statusLabel:
      pack.availability === 'soldOut'
        ? 'Місць немає'
        : available(pack.id)
          ? 'Доступний'
          : 'Уточнюємо набір',
    purchaseUrl: available(pack.id)
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
      {open && enrollment?.mode === 'disabled' && (
        <p className="package-source-note">Тестовий запис відкрито — доступ без оплати</p>
      )}
      <div className="package-grid">
        {offering.packages.map((pack) => (
          <PackageCard
            key={pack.id}
            pack={pack}
            offering={offering}
            program={program}
            enrollable={available(pack.id)}
            paymentDisabled={enrollment?.mode === 'disabled'}
          />
        ))}
      </div>
    </section>
  );
}
