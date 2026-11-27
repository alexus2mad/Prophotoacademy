import { PackageCard } from '@/components/molecules/PackageCard/PackageCard';
import { PackageComparison } from '@/components/organisms/PackageComparison/PackageComparison';
import { canEnroll, closedStatusLabel, isEnrollmentClosed } from '@/lib/format';
import { OfferingSummary } from '@/components/molecules/OfferingSummary/OfferingSummary';
import { showsInstallmentMethods } from '@/lib/commerce/selectors';
import type { ProgramPackagesProps } from './types';
export function ProgramPackages({
  offering,
  program,
  enrollment,
  packageLayout,
  summaries,
  heading,
}: ProgramPackagesProps) {
  const available = (id: string) => {
    const pack = offering.packages.find((p) => p.id === id);
    if (!pack || pack.inquiryOnly || isEnrollmentClosed(offering, pack)) return false;
    return enrollment ? enrollment.packageIds.includes(id) : canEnroll(offering, pack);
  };
  const open = offering.packages.some((p) => available(p.id));
  const compared = offering.packages.map((pack) => ({
    ...pack,
    statusLabel: isEnrollmentClosed(offering, pack)
      ? closedStatusLabel(program)
      : pack.availability === 'soldOut'
        ? 'Місць немає'
        : pack.inquiryOnly
          ? 'За запитом'
          : available(pack.id)
            ? 'Доступний'
            : 'Уточнюємо набір',
    purchaseUrl: available(pack.id)
      ? `/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`
      : undefined,
    inquiryAllowed: pack.availability !== 'soldOut',
  }));
  const availability = (
    <>
      <OfferingSummary program={program} offering={offering} />
      {!open && !isEnrollmentClosed(offering) && (
        <p className="package-source-note">
          Актуальну вартість і місця підтвердить команда перед записом.
        </p>
      )}
      {open && enrollment?.mode === 'disabled' && (
        <p className="package-source-note">Тестовий запис відкрито — доступ без оплати</p>
      )}
      {open && enrollment?.mode === 'mock' && (
        <p className="package-source-note">Тестове оформлення — без оплати й доступу до навчання</p>
      )}
    </>
  );
  return (
    <section
      className="program-packages"
      id="packages"
      data-site-locked={packageLayout === 'disclosure' ? undefined : ''}
      aria-labelledby="packages-title"
    >
      <div className="section-heading" data-site-locked={summaries ? '' : undefined}>
        {heading ?? <h2 id="packages-title">Пакети й вартість</h2>}
        {compared.length > 1 && (
          <PackageComparison
            packages={compared}
            programId={program.id}
            offeringId={offering.id}
            programTitle={program.shortTitle}
          />
        )}
      </div>
      {summaries ? <div data-site-locked="">{availability}</div> : availability}
      <div className="package-grid">
        {offering.packages.map((pack) => (
          <PackageCard
            key={pack.id}
            pack={pack}
            offering={offering}
            program={program}
            enrollable={available(pack.id)}
            paymentDisabled={enrollment?.mode === 'disabled'}
            showInstallments={showsInstallmentMethods(offering, enrollment, pack)}
            availableLessons={enrollment?.lessonTitles?.[pack.id]}
            layout={packageLayout}
            summary={summaries?.[pack.id]}
          />
        ))}
      </div>
    </section>
  );
}
