import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newSitePage } from '../src/lib/site-editor/fields';
import { HttpError } from '../src/lib/http';
import { requireAdmin } from '../src/lib/auth/server';
import { writeSitePage } from '../src/lib/site-editor/store';
import { editorStates } from '../src/lib/site-editor/storage/repository';
import * as storageConfig from '../src/lib/site-editor/storage/config';
import { compareWithProduction, rewriteForProduction } from '../src/lib/site-editor/sync/compare';
import { syncOverview, syncPage } from '../src/lib/site-editor/sync/production';
import { productionSyncHref } from '../src/lib/site-editor/sync/links';
import { GET, POST } from '../src/app/api/admin/site-content/sync/route';
import { SiteContentEditor } from '@/components/organisms/SiteContentEditor/SiteContentEditor';
import { SiteContentSync } from '@/components/organisms/SiteContentSync/SiteContentSync';
import { SiteSyncChanges } from '@/components/molecules/SiteSyncChanges/SiteSyncChanges';
import type { SitePage } from '../src/lib/site-editor/types';
import type { StagingRecord, SyncCandidate } from '../src/lib/site-editor/sync/types';
import type { SanityTestConfig, SanityTestParams } from './types';

const staging = vi.hoisted(() => ({ records: [] as StagingRecord[] }));
vi.mock('@sanity/client', async (original) => {
  const actual = await original<typeof import('@sanity/client')>();
  return {
    ...actual,
    createClient: (config: SanityTestConfig) =>
      config.projectId === '3k86g5dt'
        ? {
            fetch: async (query: string, params: SanityTestParams) =>
              query.includes('originalFilename')
                ? (params.ids ?? []).map((_id) => ({ _id, originalFilename: 'flash.webp' }))
                : staging.records.filter((r) => !params.path || r.path === params.path),
          }
        : actual.createClient(config as never),
  };
});
vi.mock('../src/lib/site-editor/seeds', async () => {
  const { newSitePage } = await import('../src/lib/site-editor/fields');
  return { newSitePage, getSiteSeeds: async () => [] };
});
vi.mock('../src/lib/site-editor/storage/repository', () => ({
  editorStates: vi.fn(async () => []),
  siteEditorWritable: vi.fn(() => true),
  persist: vi.fn(),
  seedPublishedPages: vi.fn(),
}));
vi.mock('../src/lib/site-editor/store', () => ({
  writeSitePage: vi.fn(async (page: SitePage) => ({
    page,
    revision: 'p:w',
    hasDraft: false,
    published: true,
  })),
}));
vi.mock('../src/lib/auth/server', () => ({ requireAdmin: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const stagingImages = 'https://cdn.sanity.io/images/3k86g5dt/production/';
const productionImages = 'https://cdn.sanity.io/images/qy8emt0h/production/';
const photo = 'a1b2c3-1200x800.webp';
const addresses = {
  fromImages: stagingImages,
  toImages: productionImages,
  fromOrigin: 'https://staging.prophotoacademy.com.ua',
  toOrigin: 'https://prophotoacademy.com.ua',
};

function workshop(): SitePage {
  const page = newSitePage('/flash-without-fear', 'Flash without fear', 'workshop');
  page.template = 'workshop-intensive';
  page.offerId = 'offering-flash-without-fear';
  page.sections[0].fields[2].value = stagingImages + photo;
  page.sections[0].fields[0].value = 'Деталі: https://staging.prophotoacademy.com.ua/academy';
  return page;
}
const digest = (page: unknown) => createHash('sha256').update(JSON.stringify(page)).digest('hex');

function production() {
  vi.stubEnv('SITE_EDITOR_MODE', 'sanity');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://prophotoacademy.com.ua');
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_URL', 'https://prophotoacademy.com.ua');
  vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'sfzp6094');
  vi.stubEnv('SITE_EDITOR_PROJECT_ID', 'qy8emt0h');
  vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
  vi.stubEnv('SANITY_LEARNING_DATASET', 'learning');
  vi.stubEnv('SITE_EDITOR_WRITE_TOKEN', 'production-marketing');
  vi.stubEnv('SANITY_LEARNING_WRITE_TOKEN', 'private-learning');
}

function productionClient(present: string[] = [], uploaded = 'image-a1b2c3-1200x800-webp') {
  const upload = vi.fn(async () => ({ _id: uploaded }));
  const client = {
    fetch: vi.fn(async (_query: string, params: SanityTestParams) =>
      (params.ids ?? []).filter((id) => present.includes(id)),
    ),
    assets: { upload },
  };
  vi.spyOn(storageConfig, 'marketingClient').mockReturnValue(client as never);
  return client;
}

const origin = 'https://prophotoacademy.com.ua';
const post = (body: unknown, source = origin) =>
  new Request(origin + '/api/admin/site-content/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: source },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  staging.records = [];
  vi.mocked(requireAdmin).mockReset();
  vi.mocked(writeSitePage).mockClear();
  vi.mocked(editorStates).mockResolvedValue([]);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('staging content rewrite and comparison', () => {
  it('gives photos and links production addresses and lists the photos to copy', () => {
    const { page, files } = rewriteForProduction(workshop(), addresses);
    expect(files).toEqual([photo]);
    expect(page.sections[0].fields[2].value).toBe(productionImages + photo);
    expect(page.sections[0].fields[0].value).toBe('Деталі: https://prophotoacademy.com.ua/academy');
    expect(page.offerId).toBe('offering-flash-without-fear');
  });

  it('rejects payment provider addresses, unsupported photo names and leftover staging hosts', () => {
    const paid = workshop();
    paid.sections[0].fields[0].value = 'https://secure.wayforpay.com/button/b123';
    expect(() => rewriteForProduction(paid, addresses)).toThrow(HttpError);
    const odd = workshop();
    odd.sections[0].fields[2].value = stagingImages + '../secret.png';
    expect(() => rewriteForProduction(odd, addresses)).toThrow(/непідтримувану/);
    const bare = workshop();
    bare.sections[0].fields[0].value = 'staging.prophotoacademy.com.ua';
    expect(() => rewriteForProduction(bare, addresses)).toThrow(/staging/);
  });

  it('reports new pages, matching pages and changed blocks', () => {
    const { page } = rewriteForProduction(workshop(), addresses);
    expect(compareWithProduction(page, null)).toMatchObject({ added: expect.any(Array) });
    expect(compareWithProduction(page, structuredClone(page))).toBeNull();
    const before = structuredClone(page);
    before.title = 'Старий заголовок';
    before.sections[0].fields[0].value = 'Інший текст';
    const changes = compareWithProduction(page, before);
    expect(changes).toMatchObject({ title: true, added: [], removed: [] });
    expect(changes?.changed).toHaveLength(1);
  });
});

describe('production sync', () => {
  it('is available only to a configured production installation', () => {
    production();
    expect(storageConfig.contentSyncRole()).toBe('production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.prophotoacademy.com.ua');
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_URL', 'https://staging.prophotoacademy.com.ua');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'p0dn7nmp');
    vi.stubEnv('SANITY_LEARNING_DATASET', 'learning-staging');
    vi.stubEnv('SITE_EDITOR_PROJECT_ID', '3k86g5dt');
    expect(storageConfig.contentSyncRole()).toBe('staging');
    vi.stubEnv('SITE_EDITOR_MODE', 'readonly');
    expect(storageConfig.contentSyncRole()).toBeNull();
  });

  it('lists new and changed pages with warnings and counts identical ones', async () => {
    production();
    productionClient();
    const same = newSitePage('/same', 'Та сама', 'landing');
    const legal = newSitePage('/terms', 'Умови', 'landing');
    const prodLegal = structuredClone(legal);
    prodLegal.sections[0].fields[0].value = 'Юридичний текст продакшну';
    staging.records = [
      { path: '/flash-without-fear', page: workshop() },
      { path: '/same', page: same },
      { path: '/terms', page: legal },
    ];
    vi.mocked(editorStates).mockResolvedValue([
      { path: '/same', published: same, draft: null, revision: 'a:-' },
      { path: '/terms', published: prodLegal, draft: prodLegal, revision: 'b:c' },
    ]);
    const overview = await syncOverview();
    expect(overview.identical).toBe(1);
    expect(overview.candidates.map((c) => [c.path, c.status])).toEqual([
      ['/flash-without-fear', 'new'],
      ['/terms', 'changed'],
    ]);
    const [flash, terms] = overview.candidates;
    expect(flash).toMatchObject({
      photos: 1,
      ticket: { label: 'Flash without fear', price: 4200 },
      productionDraft: false,
      stagingDigest: digest(workshop()),
      revision: null,
    });
    expect(terms).toMatchObject({ productionDraft: true, revision: 'b:c' });
  });

  it('copies missing photos, then publishes through production validation', async () => {
    production();
    const client = productionClient();
    staging.records = [{ path: '/flash-without-fear', page: workshop() }];
    const download = vi.fn(
      async () =>
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { 'content-type': 'image/webp', 'content-length': '3' },
        }),
    );
    vi.stubGlobal('fetch', download);
    await syncPage('/flash-without-fear', digest(workshop()), null);
    expect(download).toHaveBeenCalledWith(stagingImages + photo, { cache: 'no-store' });
    expect(client.assets.upload).toHaveBeenCalledWith('image', expect.any(Buffer), {
      filename: 'flash.webp',
      contentType: 'image/webp',
    });
    const [page, revision, publish] = vi.mocked(writeSitePage).mock.calls[0];
    expect((page as SitePage).sections[0].fields[2].value).toBe(productionImages + photo);
    expect([revision, publish]).toEqual([null, true]);
  });

  it('stops on a newer staging version or a photo that does not match', async () => {
    production();
    const client = productionClient([], 'image-other-1200x800-webp');
    staging.records = [{ path: '/flash-without-fear', page: workshop() }];
    await expect(syncPage('/flash-without-fear', 'f'.repeat(64), null)).rejects.toMatchObject({
      status: 409,
    });
    expect(client.assets.upload).not.toHaveBeenCalled();
    vi.stubGlobal(
      'fetch',
      async () => new Response(new Uint8Array([1]), { headers: { 'content-type': 'image/webp' } }),
    );
    await expect(syncPage('/flash-without-fear', digest(workshop()), null)).rejects.toMatchObject({
      status: 502,
    });
    expect(writeSitePage).not.toHaveBeenCalled();
  });

  it('skips photos production already holds', async () => {
    production();
    const client = productionClient(['image-a1b2c3-1200x800-webp']);
    staging.records = [{ path: '/flash-without-fear', page: workshop() }];
    const download = vi.fn();
    vi.stubGlobal('fetch', download);
    await syncPage('/flash-without-fear', digest(workshop()), 'r:-');
    expect(download).not.toHaveBeenCalled();
    expect(client.assets.upload).not.toHaveBeenCalled();
    expect(vi.mocked(writeSitePage).mock.calls[0][1]).toBe('r:-');
  });
});

describe('sync route', () => {
  it('requires an administrator, a same-origin request and a production installation', async () => {
    for (const status of [401, 403]) {
      vi.mocked(requireAdmin).mockRejectedValue(new HttpError(status, 'Доступ обмежено'));
      expect((await GET()).status).toBe(status);
      expect((await POST(post({}))).status).toBe(status);
    }
    vi.mocked(requireAdmin).mockReset();
    expect((await GET()).status).toBe(404);
    production();
    productionClient();
    expect((await POST(post({}, 'https://staging.prophotoacademy.com.ua'))).status).toBe(403);
    expect((await POST(post({ path: '/x', stagingDigest: 'bad', revision: null }))).status).toBe(
      400,
    );
    const listed = await GET();
    expect(listed.status).toBe(200);
    expect(listed.headers.get('cache-control')).toContain('no-store');
  });
});

describe('sync entry points', () => {
  const pages = [
    { path: '/a', title: 'А', kind: 'landing' as const, hasDraft: false, published: true },
  ];
  it('offers the staging change list only in the production editor', () => {
    const html = (sync: 'production' | 'staging' | null) =>
      load(
        renderToStaticMarkup(
          createElement(SiteContentEditor, { initialPages: pages, writable: true, sync }),
        ),
      );
    expect(html('production')('button:contains("Зміни зі staging")')).toHaveLength(1);
    expect(html('staging')('button:contains("Зміни зі staging")')).toHaveLength(0);
    expect(html(null)('button:contains("Зміни зі staging")')).toHaveLength(0);
  });

  it('hands a staging page to the production editor confirmation', () => {
    expect(productionSyncHref('/flash-without-fear')).toBe(
      'https://prophotoacademy.com.ua/admin/content?sync=%2Fflash-without-fear',
    );
  });

  it('starts the change list in a loading state with its heading', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteContentSync, { onClose: () => {}, onPublished: () => {} }),
      ),
    );
    expect($('h1').text()).toBe('Зміни зі staging');
    expect($('[role=status]').text()).toContain('Порівнюємо');
    expect($('section').attr('aria-busy')).toBe('true');
  });

  it('describes what a sync changes', () => {
    const candidate = {
      status: 'changed',
      changes: { title: true, added: ['Галерея'], removed: [], changed: ['Обкладинка'] },
    } as unknown as SyncCandidate;
    const $ = load(renderToStaticMarkup(createElement(SiteSyncChanges, { candidate })));
    expect(
      $('dt')
        .map((_, el) => $(el).text())
        .get(),
    ).toEqual(['Назва', 'Нові блоки', 'Змінені блоки']);
    const fresh = { ...candidate, status: 'new' } as SyncCandidate;
    expect(renderToStaticMarkup(createElement(SiteSyncChanges, { candidate: fresh }))).toContain(
      'Нова сторінка',
    );
  });
});
