import { muxClient, finishMediaUpload } from '@/lib/learning/media';
import { databasePool } from '@/lib/database/client';
import { errorResponse, HttpError } from '@/lib/http';
export async function POST(request: Request) {
  try {
    if (!process.env.MUX_WEBHOOK_SECRET) throw new HttpError(503, 'Webhook unavailable');
    const body = await request.text();
    if (body.length > 262144) throw new HttpError(413, 'Payload too large');
    let event;
    try {
      event = await muxClient().webhooks.unwrap(
        body,
        request.headers,
        process.env.MUX_WEBHOOK_SECRET,
      );
    } catch {
      throw new HttpError(401, 'Invalid webhook signature');
    }
    if (event.type === 'video.asset.ready' || event.type === 'video.asset.errored') {
      const providerId = String(event.data.upload_id || '');
      const media = (
        await databasePool().query(
          "SELECT id FROM academy.media WHERE provider_id=$1 AND kind='video'",
          [providerId],
        )
      ).rows[0];
      if (media) await finishMediaUpload(media.id);
    }
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
