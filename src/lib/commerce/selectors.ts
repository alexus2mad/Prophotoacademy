import type { Offering, Package } from '../content/types';

export const isProduct = (pack: Package) => pack.kind === 'product';

// Test access concerns published online material, not the historical classroom intake.
// Products have no learning material, so a zero-charge test record would grant nothing.
export function canTestEnroll(offering: Offering, pack: Package) {
  return (
    !isProduct(pack) &&
    !pack.inquiryOnly &&
    !['soldOut', 'archived'].includes(offering.availability) &&
    !['soldOut', 'archived'].includes(pack.availability)
  );
}
