import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedOrderStatus, sign } from '../src/lib/wayforpay';
import { cashboxUrl } from '../src/lib/commerce/cashbox';
import type { Order } from '../src/lib/ledger/types';

const order = { id: 'academy-order', mode: 'wayforpay', amount: 100, currency: 'UAH' } as Order;
function payment(status: string, refundAmount?: number) {
  const data = {
    merchantAccount: 'academy-merchant',
    orderReference: order.id,
    amount: 100,
    currency: 'UAH',
    authCode: '',
    cardPan: '',
    transactionStatus: status,
    reasonCode: 1100,
    refundAmount,
    merchantSignature: '',
  };
  data.merchantSignature = sign(
    [data.merchantAccount, data.orderReference, data.amount, data.currency, '', '', status, 1100],
    'secret',
  );
  return data;
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('cashbox ownership and Academy fulfillment', () => {
  it('links to ps-booking without forwarding credentials or trusting unsafe protocols', () => {
    expect(cashboxUrl()).toContain('booking.plainstack.net/admin.html?view=cashbox');
    vi.stubEnv('NEXT_PUBLIC_CASHBOX_URL', 'javascript:alert(1)');
    expect(cashboxUrl()).toMatch(/^https:/);
    vi.stubEnv('NEXT_PUBLIC_CASHBOX_URL', 'https://user:password@example.com');
    expect(cashboxUrl()).toContain('booking.plainstack.net');
  });
  it('fulfills a signed purchase immediately without querying the cashbox', async () => {
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect(
      await confirmedOrderStatus(payment('Approved'), order, 'academy-merchant', 'secret'),
    ).toBe('approved');
    expect(send).not.toHaveBeenCalled();
  });
  it.each([
    [40, 'approved'],
    [100, 'refunded'],
  ])(
    'preserves access for partial refunds and revokes only full refunds (%s)',
    async (amount, status) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(Response.json(payment('Refunded', Number(amount)))),
      );
      expect(
        await confirmedOrderStatus(payment('Refunded'), order, 'academy-merchant', 'secret'),
      ).toBe(status);
    },
  );
  it('rejects ambiguous refunds and mismatched orders rather than revoking access', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(payment('Refunded'))));
    await expect(
      confirmedOrderStatus(payment('Refunded'), order, 'academy-merchant', 'secret'),
    ).rejects.toThrow('Refund amount');
    await expect(
      confirmedOrderStatus(
        payment('Approved'),
        { ...order, amount: 200 },
        'academy-merchant',
        'secret',
      ),
    ).rejects.toThrow('mismatch');
  });
});
