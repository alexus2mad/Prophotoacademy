import type { EditorTarget } from '@/lib/site-editor/storage/types';
import type { SyncOverview } from '@/lib/site-editor/sync/types';
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

export async function fetchEditorPage(path: string, env: EditorTarget, signal?: AbortSignal) {
  const params = new URLSearchParams({ path });
  if (env === 'staging') params.set('env', env);
  return readResponse<EditorPage>(
    await fetch(endpoint + '?' + params, { signal, cache: 'no-store' }),
  );
}

/** Pages whose published staging version is new on production or differs from it. */
export async function fetchStagingDifferences(signal?: AbortSignal) {
  const overview = await readResponse<SyncOverview>(
    await fetch(endpoint + '/sync', { signal, cache: 'no-store' }),
  );
  return Object.fromEntries(overview.candidates.map((c) => [c.path, c.status]));
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
