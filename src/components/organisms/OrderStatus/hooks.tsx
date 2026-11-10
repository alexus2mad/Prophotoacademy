'use client';
import { useCallback, useEffect, useState } from 'react';
import type { OrderStatusProps, Status } from './types';
import { orderStatusLabel } from './selectors';
export function useOrderStatus({ token }: OrderStatusProps) {
  const [order, setOrder] = useState<Status>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/status?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Замовлення не знайдено або посилання недійсне.');
      setOrder(await response.json());
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не вдалося оновити статус.');
    }
  }, [token]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (order?.status !== 'pending') return;
    let checks = 0;
    const timer = setInterval(() => {
      void refresh();
      if (++checks >= 30) clearInterval(timer);
    }, 2000);
    return () => clearInterval(timer);
  }, [order?.status, refresh]);
  async function simulate(status: string) {
    setBusy(true);
    try {
      const response = await fetch('/api/payments/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, status }),
      });
      if (!response.ok) throw new Error('Не вдалося змінити демо-статус.');
      await refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Спробуйте ще раз.');
    } finally {
      setBusy(false);
    }
  }
  const label = orderStatusLabel(order);
  return { order, error, busy, refresh, simulate, label };
}
