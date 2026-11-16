import type { Offering, Package } from '../content/types';
import { canEnroll, isEnrollmentClosed } from '../format';
import type { EnrollmentOptions } from './types';

export const isProduct = (pack: Package) => pack.kind === 'product';

export function showsInstallmentMethods(
  offering: Offering | undefined,
  enrollment: EnrollmentOptions | undefined,
  pack?: Package,
) {
  if (!offering || !enrollment || enrollment.mode === 'disabled') return false;
  return (pack ? [pack] : offering.packages).some(
    (option) =>
      option.price > 0 && enrollment.packageIds.includes(option.id) && canEnroll(offering, option),
  );
}

// Test access concerns published online material, not the historical classroom intake.
// Products have no learning material, so a zero-charge test record would grant nothing.
export function canTestEnroll(offering: Offering, pack: Package) {
  return (
    !isProduct(pack) &&
    !isEnrollmentClosed(offering, pack) &&
    !pack.inquiryOnly &&
    !['soldOut', 'archived'].includes(offering.availability) &&
    !['soldOut', 'archived'].includes(pack.availability)
  );
}
