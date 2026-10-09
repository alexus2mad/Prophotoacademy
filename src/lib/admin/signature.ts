import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { safeEqual } from '../wayforpay';
import { HttpError } from '../http';
export function verifyManagementSignature(
  body: string,
  headers: Headers,
  secret: string,
  now = Date.now(),
) {
  const timestamp = headers.get('x-prophoto-time') || '',
    nonce = headers.get('x-prophoto-nonce') || '',
    signature = headers.get('x-prophoto-signature') || '';
  if (secret.length < 32) throw new HttpError(503, 'Management integration unavailable');
  if (
    !/^\d{13}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp)) > 300000 ||
    !z.uuid().safeParse(nonce).success
  )
    throw new HttpError(401, 'Invalid management request');
  const expected = createHmac('sha256', secret)
    .update(timestamp + '\n' + nonce + '\n' + body)
    .digest('hex');
  if (!safeEqual(expected, signature)) throw new HttpError(401, 'Invalid management signature');
  return nonce;
}
