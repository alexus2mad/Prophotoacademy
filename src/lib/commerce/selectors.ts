import type { Offering, Package } from '../content/types';

// Test access concerns published online material, not the historical classroom intake.
export function canTestEnroll(offering: Offering, pack: Package) {
  return (
    !['soldOut', 'archived'].includes(offering.availability) &&
    !['soldOut', 'archived'].includes(pack.availability)
  );
}
