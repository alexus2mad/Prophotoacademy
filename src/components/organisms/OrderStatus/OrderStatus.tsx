'use client';
import { Button } from '@/components/atoms/Button/Button';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { Check, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { useOrderStatus } from './hooks';
import type { OrderStatusProps } from './types';

export function OrderStatus({ token }: OrderStatusProps) {
  const { order, error, busy, refresh, simulate, label } = useOrderStatus({ token });
  return (
    <div className="container status-panel">
      {order?.status === 'approved' ? (
        <Check size={40} />
      ) : order?.status === 'pending' ? (
        <Clock size={40} />
      ) : (
        <X size={40} />
      )}
      <h1>{label[0]}</h1>
      <p>{label[1]}</p>
      {order?.learningAccess && (
        <Link className="button" href="/account">
          Перейти до навчання
        </Link>
      )}
      {order && (
        <p>
          {order.programTitle}
          <br />
          {order.packageName}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {(!order || order.status === 'pending') && (
        <Button className="button button-secondary" onClick={refresh}>
          Оновити статус
        </Button>
      )}
      {order?.mode === 'mock' && (
        <div className="mock-notice">
          <strong>Локальна демонстрація. Реального платежу немає.</strong>
          {order.status === 'pending' && (
            <div className="mock-actions">
              {[
                ['approved', 'Успішно'],
                ['pending', 'Очікування'],
                ['declined', 'Відмова'],
                ['canceled', 'Скасування'],
              ].map(([status, title]) => (
                <Button
                  className="text-link"
                  key={status}
                  onClick={() => simulate(status)}
                  disabled={busy}
                >
                  {title}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      {order && ['declined', 'canceled'].includes(order.status) && (
        <Link href={order.retryUrl} className="button">
          Повторити оформлення
        </Link>
      )}
      <InquiryButton className="text-link">Потрібна допомога</InquiryButton>
      <Link href="/courses" className="text-link">
        До програм
      </Link>
    </div>
  );
}
