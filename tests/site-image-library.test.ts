import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { libraryFilter, listLibraryImages } from '@/lib/site-editor/image-library/list';
import { uploadPageImage } from '@/lib/site-editor/media';
import { GET } from '@/app/api/admin/site-content/image/route';
import { requireAdmin } from '@/lib/auth/server';

vi.mock('@/lib/auth/server', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/site-editor/seeds', async () => {
  const { newSitePage } = await import('@/lib/site-editor/fields');
  return {
    newSitePage,
    getSiteSeeds: async () => {
      const page = newSitePage('/about-us', 'Про академію', 'landing');
      page.sections[0].fields.find((f) => f.kind === 'image')!.value = '/images/olena.webp';
      page.sections[0].fields.find((f) => f.id === 'alt')!.value = 'Олена Попова';
      return [page, page];
    },
  };
});

describe('marketing image library', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'academy-library-'));
    vi.stubEnv('SITE_EDITOR_MODE', 'local');
    vi.stubEnv('SITE_EDITOR_LOCAL_DIR', dir);
    vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', '');
    vi.mocked(requireAdmin).mockReset();
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(dir, { recursive: true, force: true });
  });
  it('lets editors find a photograph by context, filename or alt and deduplicates repeated placements', async () => {
    for (const q of ['академію', 'олена', 'olena.webp']) {
      const result = await listLibraryImages({ query: q, source: 'all', offset: 0 });
      expect(result).toMatchObject({
        total: 1,
        next: null,
        images: [{ name: 'Олена Попова', url: '/images/olena.webp' }],
      });
    }
  });
  it('retains a searchable upload name and reuses the same image URL on subsequent visits', async () => {
    const body = new FormData();
    const bytes = await sharp({ create: { width: 32, height: 24, channels: 3, background: 'red' } })
      .png()
      .toBuffer();
    body.set(
      'file',
      new Blob([new Uint8Array(bytes)], { type: 'image/png' }),
      'Студійний портрет.png',
    );
    const url = await uploadPageImage(
      new Request('http://localhost/upload', { method: 'POST', body }),
    );
    expect(
      await listLibraryImages({ query: 'ПОРТРЕТ', source: 'uploads', offset: 0 }),
    ).toMatchObject({ images: [{ name: 'Студійний портрет', url }], total: 1 });
    expect((await listLibraryImages({ query: '', source: 'all', offset: 1 })).images[0].url).toBe(
      '/images/olena.webp',
    );
  });
  it('validates pagination and requires administrator authorization before listing images', async () => {
    expect(() => libraryFilter(new URLSearchParams('offset=-1'))).toThrow();
    expect(() => libraryFilter(new URLSearchParams('source=private'))).toThrow();
    const { HttpError } = await import('@/lib/http');
    vi.mocked(requireAdmin).mockRejectedValue(new HttpError(401, 'Потрібен вхід'));
    const result = await GET(new Request('http://localhost/api/admin/site-content/image'));
    expect(result.status).toBe(401);
  });
});
