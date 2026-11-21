import type { EditorPage } from '@/lib/site-editor/types';
import type { UploadedSiteImage } from './types';

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

export async function uploadEditorImage(file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Оберіть зображення розміром до 10 МБ');
  const body = new FormData();
  body.set('file', file);
  return readResponse<UploadedSiteImage>(
    await fetch(endpoint + '/image', { method: 'POST', body }),
  );
}
