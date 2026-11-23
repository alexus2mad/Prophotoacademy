import type { EditorPage } from '@/lib/site-editor/types';

const endpoint = '/api/admin/site-content';

export class EditorRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => null);
  if (!response.ok || !json) {
    const message =
      typeof json?.error === 'string'
        ? json.error
        : 'Не вдалося отримати відповідь. Спробуйте ще раз';
    throw new EditorRequestError(message, response.status);
  }
  return json as T;
}

export async function fetchEditorPage(path: string, signal?: AbortSignal) {
  return readResponse<EditorPage>(
    await fetch(endpoint + '?path=' + encodeURIComponent(path), { signal, cache: 'no-store' }),
  );
}

export async function writeEditorPage(payload: object) {
  return readResponse<EditorPage>(
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}
