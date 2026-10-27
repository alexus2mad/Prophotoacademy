'use client';

import { academyThemeClassName } from '@/lib/typography/fonts';
import { useStatusSite } from './hooks';
import type { StatusFrameProps } from './types';

export function StatusFrame({ children }: StatusFrameProps) {
  const site = useStatusSite();

  return (
    <div className={site === 'academy' ? `academy-status ${academyThemeClassName}` : undefined}>
      <div className="container status-panel">{children}</div>
    </div>
  );
}
