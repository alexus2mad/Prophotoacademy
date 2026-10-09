import { Check } from 'lucide-react';
import type { PackageIncludesProps } from './types';
export function PackageIncludes({ pack }: PackageIncludesProps) {
  return (
    <ul className="check-list">
      {pack.includes.map((item) => (
        <li key={item}>
          <Check aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
