import type { EditorPage } from '@/lib/site-editor/types';
import type { SyncCandidate, SyncOverview } from '@/lib/site-editor/sync/types';

const endpoint = '/api/admin/site-content/sync';

export class SyncRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function read<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => null);
  if (!response.ok || !json)
    throw new SyncRequestError(
      typeof json?.error === 'string'
        ? json.error
        : 'Не вдалося отримати відповідь. Спробуйте ще раз',
      response.status,
    );
  return json as T;
}

export async function fetchSyncOverview(signal?: AbortSignal) {
  return read<SyncOverview>(await fetch(endpoint, { signal, cache: 'no-store' }));
}

export async function publishFromStaging(candidate: SyncCandidate) {
  return read<EditorPage>(
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: candidate.path,
        stagingDigest: candidate.stagingDigest,
        revision: candidate.revision,
      }),
    }),
  );
}
