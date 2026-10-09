'use client';
import Link from 'next/link';
import { useAccountMenu } from './hooks';
import type { AccountMenuProps } from './types';
import { managementUrl } from '@/lib/commerce/cashbox';
export function AccountMenu({ member, demo = false }: AccountMenuProps) {
  const { logout, error } = useAccountMenu();
  return (
    <details className="account-menu">
      <summary>
        <span className="account-avatar" aria-hidden="true">
          {(member.name || member.email).slice(0, 1).toUpperCase()}
        </span>
        <span>{member.name || member.email.split('@')[0]}</span>
      </summary>
      <div className="account-popover">
        <p>{member.email}</p>
        {member.role === 'admin' && (
          <>
            <a href={managementUrl()} target="_blank" rel="noopener noreferrer">
              Керування студентами
            </a>
            <Link href={demo ? '/demo/admin/courses' : '/admin/courses'}>Редактор курсів</Link>
          </>
        )}
        <Link href={demo ? '/demo/account' : '/account'}>Мої курси</Link>
        {!demo && (
          <button type="button" onClick={logout}>
            Вийти
          </button>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    </details>
  );
}
