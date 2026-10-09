import { z } from 'zod';
import { getContent } from '@/lib/content';
import { saveInquiry } from '@/lib/ledger';
import { guardMutation, jsonBody, errorResponse, HttpError, validationError } from '@/lib/http';
import { acquisitionSchema } from '@/lib/acquisition-schema';
const schema = z
  .object({
    name: z.string().trim().min(2).max(80),
    contact: z
      .string()
      .trim()
      .max(160)
      .refine(
        (value) => z.email().safeParse(value).success || /^\+?[\d\s()-]{9,24}$/.test(value),
        'Вкажіть email або телефон',
      ),
    message: z.string().trim().max(2000).nullable().optional(),
    programId: z.string().max(100).optional(),
    offeringId: z.string().max(100).optional(),
    packageId: z.string().max(100).optional(),
    practiceSessionId: z.string().max(100).optional(),
    site: z.enum(['academy', 'hub']).default('academy'),
    locality: z.enum(['kyiv', 'other']).optional(),
    marketingUpdates: z.boolean().default(false),
    acquisition: acquisitionSchema.optional(),
    website: z.string().max(100).nullable().optional(),
    consent: z.literal(true),
  })
  .strict();
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    guardMutation(request, 'inquiry');
    const input = schema.safeParse(await jsonBody(request));
    if (!input.success)
      throw validationError(input.error.issues, {
        name: 'Вкажіть ім’я від 2 до 80 символів.',
        contact: 'Вкажіть коректний email або телефон.',
        message: 'Скоротіть повідомлення до 2000 символів.',
        consent: 'Підтвердьте згоду з політикою конфіденційності.',
      });
    if (input.data.website) return Response.json({ ok: true });
    const content = await getContent();
    const session = input.data.practiceSessionId
      ? content.practiceSessions.find(
          (s) => s.id === input.data.practiceSessionId && s.status !== 'paused',
        )
      : undefined;
    if (input.data.practiceSessionId && !session) throw new HttpError(400, 'Практику не знайдено.');
    const program = input.data.programId
      ? content.programs.find((p) => p.id === input.data.programId)
      : undefined;
    if (input.data.programId && !program) throw new HttpError(400, 'Програму не знайдено.');
    const offering = input.data.offeringId
      ? content.offerings.find((o) => o.id === input.data.offeringId && o.programId === program?.id)
      : undefined;
    const pack = input.data.packageId
      ? offering?.packages.find((p) => p.id === input.data.packageId)
      : undefined;
    if ((input.data.offeringId && !offering) || (input.data.packageId && !pack))
      throw new HttpError(400, 'Пакет не знайдено.');
    const { website, ...data } = input.data;
    saveInquiry({
      ...data,
      interest: session ? 'guided-practice' : 'education',
      practiceTitle: session?.title,
      programTitle: program?.title,
      packageName: pack?.name,
      consentAt: new Date().toISOString(),
    });
    return Response.json(
      { ok: true, mode: process.env.NOTIFICATION_MODE === 'make' ? 'queued' : 'local' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
