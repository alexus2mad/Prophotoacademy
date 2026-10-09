import { jsonBody, errorResponse, HttpError } from '@/lib/http';
import { callbackInput, verifyCallback, callbackAck, confirmedOrderStatus } from '@/lib/wayforpay';
import { orderById, updateOrder } from '@/lib/commerce/orders';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (process.env.PAYMENT_MODE !== 'wayforpay') throw new HttpError(404, 'Not found');
    const raw = await jsonBody(request);
    const parsed = callbackInput.safeParse(raw);
    if (!parsed.success) throw new HttpError(400, 'Invalid callback');
    const merchant = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
    const secret = process.env.WAYFORPAY_MERCHANT_SECRET;
    if (!merchant || !secret) throw new HttpError(503, 'Payment verification unavailable');
    const order = await orderById(parsed.data.orderReference);
    if (!order) throw new HttpError(404, 'Order not found');
    verifyCallback(raw, order, merchant, secret);
    const status = await confirmedOrderStatus(parsed.data, order, merchant, secret);
    await updateOrder(order.id, status, merchant);
    return Response.json(callbackAck(parsed.data.orderReference, secret), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
