import Link from 'next/link';
import { BrandLogo } from '@/components/atoms/BrandLogo/BrandLogo';
import { AccountMenu } from '@/components/molecules/AccountMenu/AccountMenu';
import { cashboxUrl } from '@/lib/commerce/cashbox';
import { academyThemeClassName } from '@/lib/typography/fonts';
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
        ['students', 'Студенти'],
        ['team', 'Команда'],
        ['promo-codes', 'Промокоди'],
        ['cashbox', 'Каса'],
        ['settings', 'Налаштування'],
      ]
    : [
        ['courses', 'Мої курси'],
        ['purchases', 'Мої покупки'],
        ['settings', 'Налаштування'],
      ];
  return (
    <div className={admin ? 'learning-app' : `learning-app ${academyThemeClassName}`}>
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
          {admin ? 'Матеріали курсів' : 'Кабінет студента'}
        </Link>
        <AccountMenu member={member} demo={demo} />
      </header>
      <div className={'workspace-layout ' + (admin ? 'workspace-admin' : 'workspace-student')}>
        <nav className="workspace-nav" aria-label={admin ? 'Адміністрування' : 'Особистий кабінет'}>
          {links.map(([key, label]) =>
            key === 'cashbox' ? (
              <a
                key={key}
                href={cashboxUrl()}
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
