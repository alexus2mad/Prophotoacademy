import type { ValidationIssue } from './http/types';
import { hash, rateLimit } from './ledger';
import { consumeRateLimit, managedDatabase } from './database/client';
import { ZodError } from 'zod';
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}
export function validationError(issues: ValidationIssue[], messages: Record<string, string>) {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] || '');
    if (messages[key]) fields[key] = messages[key];
  }
  return new HttpError(400, Object.values(fields)[0] || 'Перевірте поля форми.', fields);
}
export async function guardMutation(request: Request, scope: string) {
  const origin = request.headers.get('origin');
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000');
  const allowed = new Set([site.origin]);
  for (const configured of [process.env.NEXT_PUBLIC_ACADEMY_URL, process.env.NEXT_PUBLIC_HUB_URL])
    if (configured?.startsWith('https://') || configured?.startsWith('http://'))
      allowed.add(new URL(configured).origin);
  if (
    process.env.NODE_ENV === 'development' &&
    ['127.0.0.1', 'localhost', '[::1]'].includes(site.hostname)
  )
    for (const host of ['127.0.0.1', 'localhost', '[::1]']) {
      const alias = new URL(site);
      alias.hostname = host;
      allowed.add(alias.origin);
    }
  if (!origin || !allowed.has(origin))
    throw new HttpError(403, 'Запит із цього джерела не дозволено.');
  const address =
    process.env.TRUST_PROXY === '1'
      ? request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
      : 'local';
  if (
    !(managedDatabase()
      ? await consumeRateLimit(`${scope}:${hash(address)}`, scope === 'progress' ? 600 : 20, 60)
      : rateLimit(`${scope}:${hash(address)}`))
  )
    throw new HttpError(429, 'Забагато запитів. Спробуйте через хвилину.');
}
export async function jsonBody(request: Request, maxBytes = 8192) {
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
  )
    throw new HttpError(415, 'Очікується JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Порожній запит.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, 'Запит завеликий.');
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Некоректний запит.');
  }
}
export function errorResponse(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof HttpError
          ? error.message
          : error instanceof ZodError
            ? error.issues[0]?.message || 'Перевірте поля'
            : 'Не вдалося виконати запит. Спробуйте ще раз.',
      fieldErrors: error instanceof HttpError ? error.fieldErrors : undefined,
    },
    {
      status: error instanceof HttpError ? error.status : error instanceof ZodError ? 400 : 500,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
