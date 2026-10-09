import { safeEqual } from '@/lib/wayforpay';
import { errorResponse, HttpError } from '@/lib/http';
import { deliverNotifications } from '@/lib/notifications/delivery';
export const maxDuration = 300;
export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || !safeEqual(request.headers.get('authorization') || '', 'Bearer ' + secret))
      throw new HttpError(401, 'Unauthorized');
    const delivery = await deliverNotifications();
    return Response.json({ delivery }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
