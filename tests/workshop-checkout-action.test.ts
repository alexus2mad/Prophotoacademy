import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  paymentDestination,
  startWorkshopCheckout,
} from '@/components/molecules/WorkshopCheckoutAction/request';

const origin = 'https://academy.example';
afterEach(() => vi.unstubAllGlobals());

describe('direct workshop checkout action', () => {
  it('consolidates all placements into one request and retries the same order after a connection failure', async () => {
    vi.stubGlobal('window', { location: new URL(origin + '/workshop?utm_source=academy') });
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('interrupted'))
      .mockImplementationOnce(async (_url, init) => {
        const { token } = JSON.parse(init.body);
        return Response.json({ url: '/thanks?token=' + token });
      });
    vi.stubGlobal('fetch', fetch);
    const endpoint = '/api/checkout/workshop?offering=practice&package=ticket';
    const one = startWorkshopCheckout(endpoint);
    expect(startWorkshopCheckout(endpoint)).toBe(one);
    await expect(one).rejects.toThrow('інтернет');
    const next = await startWorkshopCheckout(endpoint);
    const firstBody = JSON.parse(fetch.mock.calls[0][1].body);
    const retryBody = JSON.parse(fetch.mock.calls[1][1].body);
    expect(firstBody).toEqual(retryBody);
    expect(firstBody.token).toMatch(/^[a-f0-9]{64}$/);
    expect(firstBody.idempotencyKey).toMatch(/^[a-f0-9-]{36}$/);
    expect(firstBody.acquisition.utmSource).toBe('academy');
    expect(next).toBe(origin + '/thanks?token=' + firstBody.token);
  });
  it('allows the payment provider or the matching on-site receipt only', () => {
    expect(paymentDestination('https://secure.wayforpay.com/invoice/q', origin, 'test')).toBe(
      'https://secure.wayforpay.com/invoice/q',
    );
    for (const value of [
      '/elsewhere',
      '/thanks?token=other',
      'https://other.example/thanks?token=test',
      'javascript:1',
      'https://foo@secure.wayforpay.com/invoice/q',
    ])
      expect(() => paymentDestination(value, origin, 'test')).toThrow();
  });
  it('never sends the order token to another origin or another endpoint', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('window', { location: new URL(origin + '/workshop') });
    vi.stubGlobal('fetch', fetch);
    await expect(
      startWorkshopCheckout('https://elsewhere.example/api/checkout/workshop'),
    ).rejects.toThrow();
    await expect(startWorkshopCheckout('/api/admin/site-content')).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});
