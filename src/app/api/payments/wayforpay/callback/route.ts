import { jsonBody, errorResponse, HttpError } from '@/lib/http';
import { callbackInput, verifyCallback, callbackAck } from '@/lib/wayforpay';
import { orderById, updateOrder } from '@/lib/ledger';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (process.env.PAYMENT_MODE !== 'wayforpay') throw new HttpError(404, 'Not found');
    const secret = process.env.WAYFORPAY_MERCHANT_SECRET;
    const merchant = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
    if (!secret || !merchant) throw new HttpError(503, 'Callback not configured');
    const raw = await jsonBody(request);
    const parsed = callbackInput.safeParse(raw);
    if (!parsed.success) throw new HttpError(400, 'Invalid callback');
    const order = orderById(parsed.data.orderReference);
    if (!order) throw new HttpError(404, 'Order not found');
    const status = verifyCallback(raw, order, merchant, secret);
    updateOrder(order.id, status);
    return Response.json(callbackAck(order.id, secret), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
