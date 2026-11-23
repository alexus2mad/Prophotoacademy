import { emphasizedRun } from '@/lib/text/emphasis';
import type { InlineEmphasisProps } from './types';
export function InlineEmphasis({ text, phrase }: InlineEmphasisProps) {
  const run = emphasizedRun(text, phrase);
  if (!run) return text;
  return (
    <span data-site-emphasis={run.phrase}>
      {run.before}
      <strong>{run.phrase}</strong>
      {run.after}
    </span>
  );
}
