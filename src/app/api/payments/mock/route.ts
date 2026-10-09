import { z } from 'zod';
import { guardMutation, jsonBody, errorResponse, HttpError } from '@/lib/http';
import { orderByToken, updateOrder } from '@/lib/ledger';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if ((process.env.PAYMENT_MODE || 'mock') !== 'mock') throw new HttpError(404, 'Not found');
    await guardMutation(request, 'mock');
    const input = z
      .object({
        token: z.string().regex(/^[a-f0-9]{64}$/),
        status: z.enum(['approved', 'pending', 'declined', 'canceled']),
      })
      .strict()
      .safeParse(await jsonBody(request));
    if (!input.success) throw new HttpError(400, 'Invalid mock request');
    const order = orderByToken(input.data.token);
    if (!order || order.mode !== 'mock') throw new HttpError(404, 'Order not found');
    const result = updateOrder(order.id, input.data.status);
    return Response.json({ status: result.status }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
