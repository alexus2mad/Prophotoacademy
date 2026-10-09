'use client';
import { money } from '@/lib/format';
import { useMobileEnrollment } from './hooks';
import type { MobileEnrollmentProps } from './types';

export function MobileEnrollment({ price, children }: MobileEnrollmentProps) {
  const { visible } = useMobileEnrollment();
  return (
    <div className="mobile-enroll" data-visible={visible} aria-hidden={!visible} inert={!visible}>
      {price !== undefined ? (
        <a href="#packages" className="mobile-price-link">
          <strong>від {money(price)}</strong>
          <span>Пакети й вартість</span>
        </a>
      ) : (
        <p>
          Ваш особистий формат<span>Почнемо з вашої мети</span>
        </p>
      )}
      {children}
    </div>
  );
}
