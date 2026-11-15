'use client';

import { academyThemeClassName } from '@/lib/typography/fonts';
import { useStatusSite } from './hooks';
import type { StatusFrameProps } from './types';

export function StatusFrame({ children }: StatusFrameProps) {
  const site = useStatusSite();

  return (
    <main
      id="main"
      tabIndex={-1}
      className={site === 'academy' ? `academy-status ${academyThemeClassName}` : undefined}
    >
      <div className="container status-panel">{children}</div>
    </main>
  );
}
