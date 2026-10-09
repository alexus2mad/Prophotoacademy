'use client';
import { useCallback, useEffect, useState } from 'react';
import type { OrderStatusProps, Status } from './types';
const labels = {
  pending: [
    'Очікуємо підтвердження',
    'Щойно платіжна система підтвердить оплату, статус замовлення оновиться.',
  ],
  approved: [
    'Ваше навчання починається',
    'Оплату підтверджено. Команда академії зв’яжеться з вами для надання доступу та організаційних деталей.',
  ],
  declined: [
    'Оплату не підтверджено',
    'Платіж відхилено. Повторіть оформлення або зверніться до академії.',
  ],
  canceled: [
    'Оплату скасовано',
    'Кошти за цим замовленням не підтверджені. Ви можете обрати програму знову.',
  ],
  refunded: [
    'Оплату повернено',
    'Повернення підтверджено платіжною системою. За деталями зверніться до академії.',
  ],
};
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
  const label = order
    ? labels[order.status]
    : ['Перевіряємо замовлення', 'Зачекайте кілька секунд.'];
  return { order, error, busy, refresh, simulate, label };
}
