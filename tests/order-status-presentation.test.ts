import { describe, expect, it } from 'vitest';
import { orderStatusLabel } from '../src/components/organisms/OrderStatus/selectors';
import type { Status } from '../src/components/organisms/OrderStatus/types';

const ticket: Status = {
  mode: 'wayforpay',
  status: 'approved',
  productKind: 'product',
  learningAccess: false,
  programTitle: 'Test workshop',
  packageName: 'Online',
  retryUrl: '/checkout',
};

describe('order status communication', () => {
  it.each(['pending', 'approved', 'declined', 'canceled'] as const)(
    'identifies a mock %s result without claiming payment, access or an email',
    (status) => {
      const [title, message] = orderStatusLabel({ ...ticket, mode: 'mock', status });
      expect(title).toContain('Тестов');
      expect(message).toContain('кошти не списувалися');
      expect(message).toContain('квиток чи доступ не надавалися');
      expect(message).toContain('на email не надсилалося');
    },
  );

  it('keeps paid ticket confirmation separate from course access', () => {
    const [title, message] = orderStatusLabel(ticket);
    expect(title).toBe('Оплату підтверджено');
    expect(message).not.toContain('курс уже');
    expect(orderStatusLabel({ ...ticket, productKind: 'course', learningAccess: true })[0]).toBe(
      'Ваш курс уже в кабінеті',
    );
  });
});
