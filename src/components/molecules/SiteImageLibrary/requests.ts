import type {
  ImageLibraryResult,
  ImageSource,
  LibraryImage,
} from '@/lib/site-editor/image-library/types';
import type { EditorTarget } from '@/lib/site-editor/storage/types';

const endpoint = '/api/admin/site-content/image';

async function responseData<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new Error(data?.error || 'Не вдалося відкрити зображення. Спробуйте ще раз.');
  return data;
}

export async function browseImages(
  query: string,
  source: ImageSource,
  offset: number,
  signal: AbortSignal,
  target: EditorTarget = 'production',
) {
  const params = new URLSearchParams({ q: query, source, offset: String(offset) });
  if (target === 'staging') params.set('env', target);
  return responseData<ImageLibraryResult>(
    await fetch(endpoint + '?' + params, { cache: 'no-store', signal }),
  );
}

export async function uploadImage(
  file: File,
  signal: AbortSignal,
  target: EditorTarget = 'production',
) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Оберіть зображення розміром до 10 МБ.');
  const body = new FormData();
  body.set('file', file);
  const result = await responseData<Pick<LibraryImage, 'url'>>(
    await fetch(endpoint + (target === 'staging' ? '?env=staging' : ''), {
      method: 'POST',
      body,
      signal,
    }),
  );
  return result.url;
}
