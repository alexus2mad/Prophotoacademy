import { orderByToken } from '@/lib/commerce/orders';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return Response.json({ error: 'Invalid token' }, { status: 404 });
  const order = await orderByToken(token);
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
  return Response.json(
    {
      status: order.status,
      programTitle: order.programTitle,
      packageName: order.packageName,
      mode: order.mode,
      retryUrl:
        order.mode === 'mock' && order.offeringId === 'demo-offering'
          ? '/checkout?demo=1'
          : `/checkout?offering=${encodeURIComponent(order.offeringId)}&package=${encodeURIComponent(order.packageId)}`,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
