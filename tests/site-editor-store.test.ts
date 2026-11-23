import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { createClient } from '@sanity/client';
import * as storageConfig from '../src/lib/site-editor/storage/config';
import { sanitySave } from '../src/lib/site-editor/storage/sanity';
import { legacyAcademyIndexPaths } from '../src/lib/navigation/academy';
import { revalidatePath } from 'next/cache';
import { newSitePage } from '../src/lib/site-editor/fields';
import { createBlock } from '../src/lib/site-editor/blocks';
import { validateEdit } from '../src/lib/site-editor/validation';
import {
  createSiteDraft,
  getEditorPage,
  getPublishedPage,
  listEditorPages,
  listPublishedPages,
  seedPublishedPages,
  siteEditorWritable,
  writeSitePage,
} from '../src/lib/site-editor/store';
import { uploadPageImage, readLocalImage } from '../src/lib/site-editor/media';
import { HttpError } from '../src/lib/http';
import { requireAdmin } from '../src/lib/auth/server';
import { GET, POST } from '../src/app/api/admin/site-content/route';
import { POST as upload } from '../src/app/api/admin/site-content/image/route';

vi.mock('../src/lib/site-editor/seeds', async () => {
  const { newSitePage } = await import('../src/lib/site-editor/fields');
  return {
    newSitePage,
    getSiteSeeds: async () => [newSitePage('/existing', 'Чинна сторінка', 'landing')],
  };
});
vi.mock('../src/lib/auth/server', () => ({ requireAdmin: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
const origin = 'http://127.0.0.1:3000';
const existing = () => newSitePage('/existing', 'Чинна сторінка', 'landing');

function json(input: unknown, source = origin) {
  return new Request(origin + '/api/admin/site-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: source },
    body: JSON.stringify(input),
  });
}
function imageRequest(bytes: Uint8Array<ArrayBuffer>, name = 'source.png') {
  const data = new FormData();
  data.set('file', new Blob([bytes]), name);
  return new Request(origin + '/api/admin/site-content/image', {
    method: 'POST',
    headers: { Origin: origin },
    body: data,
  });
}

describe('visual editor persistence and authorization', () => {
  let directory: string;
  beforeEach(() => {
    directory = mkdtempSync(path.join(os.tmpdir(), 'prophoto-site-editor-'));
    vi.stubEnv('SITE_EDITOR_MODE', 'local');
    vi.stubEnv('SITE_EDITOR_LOCAL_DIR', directory);
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', '');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', origin);
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(revalidatePath).mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(directory, { recursive: true, force: true });
  });

  it('keeps a seeded publication visible during draft edits and rejects stale revisions', async () => {
    const original = existing();
    expect(await seedPublishedPages([original])).toEqual({ total: 1, inserted: 1, preserved: 0 });
    const first = await getEditorPage(original.path);
    const update = structuredClone(first.page);
    update.sections[0].fields[0].value = 'Нова обкладинка';
    const saved = await writeSitePage(update, first.revision, false);
    expect(saved).toMatchObject({ hasDraft: true, published: true, page: update });
    expect(await getPublishedPage(original.path)).toEqual(original);
    expect(await listPublishedPages()).toEqual([original]);
    await expect(writeSitePage(update, first.revision, true)).rejects.toMatchObject({
      status: 409,
    });
    const published = await writeSitePage(update, saved.revision, true);
    expect(published).toMatchObject({ hasDraft: false, published: true, page: update });
    expect(await seedPublishedPages([original])).toEqual({ total: 1, inserted: 0, preserved: 1 });
    expect(await getPublishedPage(original.path)).toEqual(update);
  });

  it('creates a private draft, extends its sections and atomically publishes at a free path', async () => {
    const draft = await createSiteDraft('/novyi-kurs', 'Новий курс', 'course');
    expect(draft).toMatchObject({ hasDraft: true, published: false });
    expect(await getPublishedPage('/novyi-kurs')).toBeNull();
    expect(await listEditorPages()).toContainEqual({
      path: '/novyi-kurs',
      title: 'Новий курс',
      kind: 'course',
      hasDraft: true,
      published: false,
    });
    await expect(createSiteDraft('/novyi-kurs', 'Замінити', 'course')).rejects.toMatchObject({
      status: 409,
    });
    await expect(createSiteDraft('/admin', 'Замінити', 'landing')).rejects.toMatchObject({
      status: 409,
    });
    for (const alias of legacyAcademyIndexPaths)
      await expect(createSiteDraft(alias, 'Зайнято', 'landing')).rejects.toMatchObject({
        status: 409,
      });
    await expect(createSiteDraft('/existing', 'Замінити', 'landing')).rejects.toMatchObject({
      status: 409,
    });
    await expect(createSiteDraft('/checkout/redirect', 'Замінити', 'landing')).rejects.toThrow();
    const custom = structuredClone(draft.page.sections[1]);
    custom.id = 'landing-body-1';
    custom.fields[0].value = 'Матеріали';
    draft.page.sections.push(custom);
    const results = await Promise.allSettled([
      writeSitePage(draft.page, draft.revision, true),
      writeSitePage(draft.page, draft.revision, true),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((r) => r.status === 'rejected')).toMatchObject({ reason: { status: 409 } });
    expect(await getPublishedPage(draft.page.path)).toEqual(draft.page);
  });

  it('preserves unpublished work when the seed is rerun', async () => {
    const draft = await writeSitePage(existing(), null, false);
    expect(await seedPublishedPages([existing()])).toEqual({ total: 1, inserted: 0, preserved: 1 });
    expect((await getEditorPage('/existing')).revision).toBe(draft.revision);
    expect(await getPublishedPage('/existing')).toBeNull();
  });

  it('persists authored content and styled native copy on seeded pages only after explicit publication', async () => {
    const old = existing();
    await seedPublishedPages([old]);
    const entry = await getEditorPage(old.path);
    const heading = createBlock('heading');
    heading.fields[0].value = 'Роботи студентів';
    entry.page.sections.push(heading);
    entry.page.sections[0].fields[0].style = { color: 'accent' };
    const draft = await writeSitePage(entry.page, entry.revision, false);
    expect((await getEditorPage(old.path)).page).toEqual(entry.page);
    expect(await getPublishedPage(old.path)).toEqual(old);
    await writeSitePage(draft.page, draft.revision, true);
    expect(await getPublishedPage(old.path)).toEqual(entry.page);
  });

  it('accepts a chosen starting template through the authorized admin creation route', async () => {
    const create = {
      action: 'create',
      path: '/kompozytsiia',
      title: 'Композиція',
      kind: 'landing',
      template: 'editorial',
    };
    const response = await POST(json(create));
    expect(response.status).toBe(201);
    const draft = await response.json();
    expect(draft.page.template).toBe('editorial');
    expect(draft.page.sections).toHaveLength(3);
    expect(draft.page.sections[1].blockType).toBe('paragraph');
    expect((await getEditorPage(create.path)).page).toEqual(draft.page);
    expect(await getPublishedPage(create.path)).toBeNull();
    await expect(writeSitePage(draft.page, draft.revision, true)).rejects.toMatchObject({
      status: 400,
    });
    const invalid = await POST(
      json({ ...create, path: '/invalid-template', template: 'checkout' }),
    );
    expect(invalid.status).toBe(400);
  });

  it('limits edits to the template and rejects unsuitable image values', async () => {
    const page = existing();
    page.sections[1].fields[0].id = 'price';
    await expect(writeSitePage(page, null, true)).rejects.toMatchObject({ status: 400 });
    const valid = existing();
    const image = valid.sections[0].fields[2];
    image.value = 'https://example.com/arbitrary.png';
    await expect(writeSitePage(valid, null, true)).rejects.toMatchObject({ status: 400 });
    image.value = '/images/visual.webp';
    await expect(writeSitePage(valid, null, true)).rejects.toMatchObject({ status: 400 });
    valid.sections[0].fields[3].value = 'Фото учнів';
    await expect(writeSitePage(valid, null, true)).resolves.toMatchObject({ published: true });
  });

  it('converts a real upload to WebP without upscaling and rejects disguised documents', async () => {
    const source = await sharp({
      create: { width: 32, height: 16, channels: 3, background: '#c44035' },
    })
      .png()
      .toBuffer();
    const url = await uploadPageImage(imageRequest(new Uint8Array(source)));
    expect(url).toMatch(/^\/api\/site-content\/images\/[a-f0-9]{64}$/);
    const bytes = await readLocalImage(url.split('/').at(-1)!);
    expect(await sharp(bytes).metadata()).toMatchObject({ format: 'webp', width: 32, height: 16 });
    await expect(readLocalImage('../secret')).rejects.toMatchObject({ status: 404 });
    await expect(
      uploadPageImage(imageRequest(new TextEncoder().encode('<svg/>'), 'spoof.jpg')),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('disables writes and real CMS reads for Pages, and rejects local storage on production', async () => {
    vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', 'pages');
    expect(siteEditorWritable()).toBe(false);
    expect(await listPublishedPages()).toEqual([]);
    await expect(writeSitePage(existing(), null, false)).rejects.toMatchObject({ status: 503 });
    vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => siteEditorWritable()).toThrow('Локальний редактор');
  });

  it('requires the isolated staging writer and the public staging marketing target', () => {
    vi.stubEnv('SITE_EDITOR_MODE', 'sanity');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.prophotoacademy.com.ua');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'p0dn7nmp');
    vi.stubEnv('SITE_EDITOR_PROJECT_ID', '3k86g5dt');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('SANITY_LEARNING_DATASET', 'learning-staging');
    vi.stubEnv('SANITY_LEARNING_WRITE_TOKEN', 'private-learning');
    vi.stubEnv('SANITY_API_WRITE_TOKEN', '');
    vi.stubEnv('SANITY_API_READ_TOKEN', 'legacy-project-reader');
    vi.stubEnv('SITE_EDITOR_WRITE_TOKEN', 'public-marketing');
    expect(siteEditorWritable()).toBe(true);
    expect(storageConfig.marketingClient(true).config()).toMatchObject({
      projectId: '3k86g5dt',
      dataset: 'production',
      token: 'public-marketing',
    });
    const published = storageConfig.marketingClient().config();
    expect(published).toMatchObject({ projectId: '3k86g5dt', perspective: 'published' });
    expect(published.token).toBeUndefined();
    const edited = existing();
    const photo = edited.sections[0].fields[2];
    photo.value = 'https://cdn.sanity.io/images/3k86g5dt/production/daea-32x16.webp';
    expect(validateEdit(edited, existing(), true, false)).toEqual(edited);
    for (const otherProject of ['p0dn7nmp', 'sfzp6094']) {
      photo.value = `https://cdn.sanity.io/images/${otherProject}/production/daea-32x16.webp`;
      expect(() => validateEdit(edited, existing(), true, false)).toThrow();
    }
    for (const [key, value] of [
      ['SITE_EDITOR_PROJECT_ID', ''],
      ['SITE_EDITOR_PROJECT_ID', 'p0dn7nmp'],
      ['SITE_EDITOR_PROJECT_ID', 'sfzp6094'],
      ['SITE_EDITOR_PROJECT_ID', 'other'],
      ['SITE_EDITOR_WRITE_TOKEN', ''],
      ['SITE_EDITOR_WRITE_TOKEN', 'private-learning'],
      ['SANITY_API_WRITE_TOKEN', 'generic'],
      ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'sfzp6094'],
      ['NEXT_PUBLIC_SANITY_DATASET', 'learning-staging'],
      ['NEXT_PUBLIC_SANITY_DATASET', 'other'],
      ['SANITY_LEARNING_DATASET', 'learning'],
    ]) {
      const previous = process.env[key];
      vi.stubEnv(key, value);
      expect(siteEditorWritable(), key).toBe(false);
      expect(() => storageConfig.marketingClient(true), key).toThrow();
      vi.stubEnv(key, previous);
    }
    vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', 'pages');
    expect(siteEditorWritable()).toBe(false);
  });

  it('retains the existing non-staging writer and prefers a dedicated one when configured', () => {
    vi.stubEnv('SITE_EDITOR_MODE', 'sanity');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'sfzp6094');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('SANITY_LEARNING_DATASET', 'learning');
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_URL', 'https://prophotoacademy.com.ua');
    vi.stubEnv('SITE_EDITOR_WRITE_TOKEN', '');
    vi.stubEnv('SANITY_API_WRITE_TOKEN', 'existing');
    vi.stubEnv('SANITY_API_READ_TOKEN', 'existing-reader');
    expect(storageConfig.marketingClient().config()).toMatchObject({
      projectId: 'sfzp6094',
      token: 'existing-reader',
    });
    expect(storageConfig.marketingClient(true).config().token).toBe('existing');
    vi.stubEnv('SITE_EDITOR_WRITE_TOKEN', 'dedicated');
    expect(storageConfig.marketingClient(true).config().token).toBe('dedicated');
  });

  it('guards admin reads, changes and uploads, including cross-origin writes', async () => {
    for (const status of [401, 403]) {
      vi.mocked(requireAdmin).mockRejectedValue(new HttpError(status, 'Доступ обмежено'));
      expect((await GET(new Request(origin + '/api/admin/site-content'))).status).toBe(status);
      expect((await POST(json({}))).status).toBe(status);
      expect((await upload(imageRequest(new Uint8Array()))).status).toBe(status);
    }
    vi.mocked(requireAdmin).mockReset();
    expect((await POST(json({}, 'https://example.com'))).status).toBe(403);
    const read = await GET(new Request(origin + '/api/admin/site-content?path=/existing'));
    expect(read.status).toBe(200);
    expect(read.headers.get('cache-control')).toContain('no-store');
    const created = await POST(
      json({ action: 'create', title: 'Подія', path: '/unikalna-podiia', kind: 'workshop' }),
    );
    expect(created.status).toBe(201);
    const draft = await created.json();
    expect(draft).toMatchObject({ published: false, hasDraft: true });
    const result = await POST(
      json({ action: 'publish', page: draft.page, revision: draft.revision }),
    );
    expect(result.status).toBe(200);
    expect(vi.mocked(revalidatePath).mock.calls.map(([url]) => url)).toEqual([
      '/unikalna-podiia',
      '/academy',
      '/sitemap.xml',
    ]);
  });

  it('sends creation and publication with revision guards in a single Sanity SDK transaction', async () => {
    const page = existing();
    const hash = createHash('sha256').update(page.path).digest('hex');
    const published = 'site-page-' + hash;
    const working = 'drafts.site-page-work-' + hash;
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'editor-test');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'marketing');
    page.sections[0].fields[2].value =
      'https://cdn.sanity.io/images/editor-test/marketing/daea-32x16.webp';
    const client = createClient({
      projectId: 'editor-test',
      dataset: 'marketing',
      apiVersion: '2026-10-01',
      useCdn: false,
    });
    const tx = client.transaction();
    const mockClient = vi.spyOn(storageConfig, 'marketingClient').mockReturnValue(client);
    vi.spyOn(client, 'transaction').mockReturnValue(tx);
    Object.assign(client, {
      fetch: async () => [
        { _id: working, _type: 'academySitePageWorkspace', _rev: 'a', path: page.path, page },
      ],
    });
    vi.spyOn(tx, 'commit').mockRejectedValue({ statusCode: 409 });
    try {
      await expect(sanitySave(page, '-:a', true)).rejects.toMatchObject({ status: 409 });
      expect(tx.serialize()).toMatchObject([
        { patch: { id: working, ifRevisionID: 'a', set: { page: null, images: [] } } },
        {
          create: {
            _id: published,
            _type: 'academySitePage',
            path: page.path,
            images: [{ _type: 'reference', _ref: 'image-daea-32x16-webp' }],
            page: { title: page.title },
          },
        },
      ]);
      expect(tx.commit).toHaveBeenCalledWith({
        returnDocuments: true,
        returnFirst: false,
        visibility: 'sync',
      });
    } finally {
      mockClient.mockRestore();
    }
  });
});
