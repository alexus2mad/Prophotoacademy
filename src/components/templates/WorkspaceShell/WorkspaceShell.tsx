import Link from 'next/link';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { AccountMenu } from '@/components/molecules/AccountMenu/AccountMenu';
import { cashboxUrl, managementUrl } from '@/lib/commerce/cashbox';
import type { WorkspaceShellProps } from './types';
export function WorkspaceShell({
  children,
  member,
  demo = false,
  section = 'courses',
  admin = false,
}: WorkspaceShellProps) {
  const base = demo ? '/demo' : '';
  const links = admin
    ? [
        ['courses', 'Курси'],
        ['management', 'Керування студентами'],
        ['cashbox', 'Каса'],
        ['settings', 'Налаштування'],
      ]
    : [
        ['courses', 'Мої курси'],
        ['purchases', 'Мої покупки'],
        ['settings', 'Налаштування'],
      ];
  return (
    <div className="learning-app">
      {demo && (
        <div className="learning-demo-note">
          Демонстрація кабінету · приклади даних, без реальних оплат
          <Link href={admin ? '/demo/account' : '/demo/admin'}>
            {admin ? 'Кабінет студента' : 'Редактор курсів'}
          </Link>
        </div>
      )}
      <header className="workspace-header">
        <Link href="/" className="brand-link" aria-label="ProPhoto — головна">
          <BrandLogo />
        </Link>
        <Link className="workspace-area" href={base + (admin ? '/admin' : '/account')}>
          {admin ? 'Матеріали курсів' : 'Моє навчання'}
        </Link>
        <AccountMenu member={member} demo={demo} />
      </header>
      <div className={'workspace-layout' + (admin ? ' workspace-admin' : '')}>
        <nav className="workspace-nav" aria-label={admin ? 'Адміністрування' : 'Особистий кабінет'}>
          {links.map(([key, label]) =>
            key === 'cashbox' || key === 'management' ? (
              <a
                key={key}
                href={key === 'cashbox' ? cashboxUrl() : managementUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label + ' — ps-booking, нова вкладка'}
              >
                {label}
              </a>
            ) : (
              <Link
                key={key}
                aria-current={section === key ? 'page' : undefined}
                href={
                  base +
                  (admin
                    ? '/admin' + (key === 'overview' ? '' : '/' + key)
                    : '/account' + (key === 'courses' ? '' : '/' + key))
                }
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        <main id="main" className="workspace-content">
          {children}
        </main>
      </div>
    </div>
  );
}
