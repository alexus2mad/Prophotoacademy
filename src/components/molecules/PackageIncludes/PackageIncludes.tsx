import { InlineEmphasis } from '@/components/atoms/InlineEmphasis/InlineEmphasis';
import { Check } from 'lucide-react';
import type { PackageIncludesProps } from './types';
export function PackageIncludes({ pack, emphasis }: PackageIncludesProps) {
  return (
    <ul className="check-list">
      {pack.includes.map((item) => (
        <li key={item}>
          <Check aria-hidden="true" />
          {emphasis ? <InlineEmphasis text={item} phrase={emphasis(item)} /> : item}
        </li>
      ))}
    </ul>
  );
}
