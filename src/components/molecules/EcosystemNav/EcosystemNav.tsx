'use client';
import { siteHref } from '@/lib/ecosystem';
import type { EcosystemNavProps } from './types';

export function EcosystemNav({ site, onNavigate }: EcosystemNavProps) {
  return (
    <nav className="ecosystem-nav" aria-label="Напрями ProPhoto">
      <a
        href={siteHref('academy')}
        aria-current={site === 'academy' ? 'true' : undefined}
        onClick={onNavigate}
        data-ecosystem-target="academy"
        aria-label={site === 'hub' ? 'Навчання — сайт ProPhoto Academy' : undefined}
      >
        Навчання
      </a>
      <span aria-hidden="true">·</span>
      <a
        href={siteHref('hub')}
        aria-current={site === 'hub' ? 'true' : undefined}
        onClick={onNavigate}
        data-ecosystem-target="hub"
        aria-label={site === 'academy' ? 'Студія — сайт ProPhoto Hub' : undefined}
      >
        Студія
      </a>
    </nav>
  );
}
