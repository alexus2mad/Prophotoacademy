import { z } from 'zod';
import { getContent } from '@/lib/content';
import { resolvePurchase } from '@/lib/checkout';
import { databasePool, managedDatabase } from '@/lib/database/client';
import { errorResponse, guardMutation, HttpError, jsonBody, validationError } from '@/lib/http';
import { paymentMode } from '@/lib/commerce/payment-mode';
import { quotePromo } from '@/lib/commerce/promo';
export const runtime = 'nodejs';
const promoRequest = z
  .object({
    offeringId: z.string().min(1).max(100),
    packageId: z.string().min(1).max(100),
    promoCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,32}$/),
  })
  .strict();
// Preview only: the order applies the code again, atomically, when it is created.
export async function POST(request: Request) {
  try {
    await guardMutation(request, 'promo');
    const parsed = promoRequest.safeParse(await jsonBody(request));
    if (!parsed.success)
      throw validationError(parsed.error.issues, { promoCode: 'Промокод недійсний' });
    if (paymentMode() !== 'wayforpay')
      throw new HttpError(422, 'Промокод не потрібен', { promoCode: 'Промокод не потрібен' });
    if (!managedDatabase())
      throw new HttpError(503, 'Промокоди тимчасово недоступні', {
        promoCode: 'Промокоди тимчасово недоступні',
      });
    const { program, pack } = resolvePurchase(
      await getContent(),
      parsed.data.offeringId,
      parsed.data.packageId,
    );
    const quote = await quotePromo(databasePool(), {
      code: parsed.data.promoCode,
      programId: program.id,
      amount: pack.price,
    });
    return Response.json(
      { ...quote, listAmount: pack.price },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
