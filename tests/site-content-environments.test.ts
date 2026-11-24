import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../src/lib/http';
import { requireAdmin } from '../src/lib/auth/server';
import * as storageConfig from '../src/lib/site-editor/storage/config';
import { currentTarget } from '../src/lib/site-editor/storage/target';
import {
  mergeEnvironments,
  needsAttention,
  previewHref,
  stateLabel,
} from '../src/lib/site-editor/environments';
import { groupPages, pageGroupId } from '../src/lib/site-editor/page-groups';
import { GET, POST } from '../src/app/api/admin/site-content/route';
import { GET as images } from '../src/app/api/admin/site-content/image/route';
import { SitePageBrowser } from '@/components/organisms/SitePageBrowser/SitePageBrowser';
import { SiteContentEditor } from '@/components/organisms/SiteContentEditor/SiteContentEditor';
import type { SanityTestConfig } from './types';
import type { SitePageSummary } from '../src/lib/site-editor/types';

const clients = vi.hoisted(() => ({
  configs: [] as Record<string, unknown>[],
  commits: [] as unknown[],
}));
vi.mock('@sanity/client', async (original) => {
  const actual = await original<typeof import('@sanity/client')>();
  return {
    ...actual,
    // Records every client the editor creates; writes are captured instead of sent.
    createClient: (config: SanityTestConfig & Record<string, unknown>) => {
      clients.configs.push(config);
      const operations: unknown[] = [];
      const transaction = {
        create(doc: unknown) {
          operations.push(doc);
          return transaction;
        },
        patch() {
          return transaction;
        },
        async commit() {
          clients.commits.push({ projectId: config.projectId, operations });
          return operations.map((doc) => ({ ...(doc as object), _rev: 'r1' }));
        },
      };
      return { fetch: async () => [], transaction: () => transaction, config: () => config };
    },
  };
});
vi.mock('../src/lib/site-editor/seeds', async () => {
  const { newSitePage } = await import('../src/lib/site-editor/fields');
  return {
    newSitePage,
    getSiteSeeds: async () => [newSitePage('/existing', 'Чинна сторінка', 'landing')],
  };
});
vi.mock('../src/lib/auth/server', () => ({ requireAdmin: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const origin = 'https://prophotoacademy.com.ua';
function production(stagingWriter = 'staging-marketing') {
  vi.stubEnv('SITE_EDITOR_MODE', 'sanity');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', origin);
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_URL', origin);
  vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'sfzp6094');
  vi.stubEnv('SITE_EDITOR_PROJECT_ID', 'qy8emt0h');
  vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
  vi.stubEnv('SANITY_LEARNING_DATASET', 'learning');
  vi.stubEnv('SITE_EDITOR_WRITE_TOKEN', 'production-marketing');
  vi.stubEnv('SANITY_LEARNING_WRITE_TOKEN', 'private-learning');
  vi.stubEnv('SITE_EDITOR_STAGING_WRITE_TOKEN', stagingWriter);
}
const post = (body: unknown) =>
  new Request(origin + '/api/admin/site-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  clients.configs.length = 0;
  clients.commits.length = 0;
  vi.mocked(requireAdmin).mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('staging target on the production admin', () => {
  it('resolves the staging project, writer and photo prefix only inside a staging scope', async () => {
    production();
    expect(storageConfig.stagingTargetAvailable()).toBe(true);
    expect(storageConfig.marketingImagePrefix()).toBe(
      'https://cdn.sanity.io/images/qy8emt0h/production/',
    );
    await storageConfig.withEditorTarget('staging', async () => {
      expect(currentTarget()).toBe('staging');
      expect(storageConfig.marketingImagePrefix()).toBe(
        'https://cdn.sanity.io/images/3k86g5dt/production/',
      );
      expect(storageConfig.marketingClient(true).config()).toMatchObject({
        projectId: '3k86g5dt',
        dataset: 'production',
        token: 'staging-marketing',
      });
      expect(storageConfig.marketingClient().config().token).toBeUndefined();
      // The installation's role does not change inside the scope.
      expect(storageConfig.contentSyncRole()).toBe('production');
    });
    expect(currentTarget()).toBe('production');
    expect(storageConfig.marketingClient(true).config()).toMatchObject({
      projectId: 'qy8emt0h',
      token: 'production-marketing',
    });
  });

  it('is unavailable without a separate staging writer or outside production', () => {
    for (const shared of ['', 'production-marketing', 'private-learning']) {
      production(shared);
      expect(storageConfig.stagingTargetAvailable(), shared).toBe(false);
      expect(() => storageConfig.withEditorTarget('staging', () => 1)).toThrow(HttpError);
      vi.unstubAllEnvs();
    }
    production();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.prophotoacademy.com.ua');
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_URL', 'https://staging.prophotoacademy.com.ua');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'p0dn7nmp');
    vi.stubEnv('SANITY_LEARNING_DATASET', 'learning-staging');
    vi.stubEnv('SITE_EDITOR_PROJECT_ID', '3k86g5dt');
    expect(storageConfig.contentSyncRole()).toBe('staging');
    expect(storageConfig.stagingTargetAvailable()).toBe(false);
  });

  it('creates a staging page through the staging project only', async () => {
    production();
    const created = await POST(
      post({ action: 'create', env: 'staging', path: '/vesna', title: 'Весна', kind: 'landing' }),
    );
    expect(created.status).toBe(201);
    expect(clients.commits).toHaveLength(1);
    expect(clients.commits[0]).toMatchObject({ projectId: '3k86g5dt' });
    const writers = clients.configs.filter((c) => c.token);
    expect(writers.every((c) => c.projectId === '3k86g5dt')).toBe(true);
  });

  it('refuses staging requests when the target is unavailable', async () => {
    production('');
    const list = await GET(new Request(origin + '/api/admin/site-content?env=staging'));
    expect(list.status).toBe(404);
    const write = await POST(
      post({ action: 'create', env: 'staging', path: '/vesna', title: 'Весна', kind: 'landing' }),
    );
    expect(write.status).toBe(404);
    expect(
      (await images(new Request(origin + '/api/admin/site-content/image?env=staging'))).status,
    ).toBe(404);
    expect(clients.commits).toHaveLength(0);
  });

  it('still requires an administrator for staging content', async () => {
    production();
    vi.mocked(requireAdmin).mockRejectedValue(new HttpError(401, 'Увійдіть'));
    expect((await GET(new Request(origin + '/api/admin/site-content?env=staging'))).status).toBe(
      401,
    );
  });
});

const summary = (path: string, kind: SitePageSummary['kind'], extra = {}): SitePageSummary => ({
  path,
  title: path,
  kind,
  hasDraft: false,
  published: true,
  ...extra,
});

describe('page list model', () => {
  it('groups pages by site section in navigation order', () => {
    const pages = [
      summary('/privacy-policy', 'landing'),
      summary('/content-creator', 'course'),
      summary('/flash-without-fear', 'workshop'),
      summary('/ai-artwork', 'workshop'),
      summary('/', 'home'),
      summary('/new-landing', 'landing'),
      summary('/contacts', 'landing'),
      summary('/individual-training', 'course'),
    ];
    expect(groupPages(pages).map((g) => [g.label, g.pages.map((p) => p.path)])).toEqual([
      ['Головна та Академія', ['/']],
      ['Курси', ['/content-creator']],
      ['Воркшопи та інтенсиви', ['/flash-without-fear']],
      ['Навчання на замовлення', ['/individual-training']],
      ['Студія, магазин та AI', ['/ai-artwork']],
      ['Про академію', ['/contacts']],
      ['Юридичні документи', ['/privacy-policy']],
      ['Інші сторінки', ['/new-landing']],
    ]);
    expect(pageGroupId(summary('/academy', 'landing'))).toBe('home');
  });

  it('merges both environments and marks staging differences', () => {
    const rows = mergeEnvironments(
      [summary('/a', 'landing'), summary('/terms-of-service', 'landing')],
      [
        summary('/a', 'landing', { hasDraft: true }),
        summary('/terms-of-service', 'landing'),
        summary('/flash-without-fear', 'workshop'),
      ],
      { '/terms-of-service': 'changed', '/flash-without-fear': 'new' },
    );
    expect(rows.map((r) => r.path)).toEqual(['/a', '/terms-of-service', '/flash-without-fear']);
    const [a, terms, flash] = rows;
    expect([stateLabel(a.production), stateLabel(a.staging)]).toEqual(['Опубліковано', 'Чернетка']);
    expect(terms.differs).toBe('changed');
    expect([flash.production, flash.differs, stateLabel(flash.production)]).toEqual([
      undefined,
      'new',
      'Немає',
    ]);
    expect(rows.map(needsAttention)).toEqual([true, true, true]);
    expect(needsAttention(mergeEnvironments([summary('/b', 'landing')])[0])).toBe(false);
  });

  it('previews drafts and published versions of either environment', () => {
    expect(previewHref('/a', 'production', 'draft')).toBe('/a?site-editor-preview=1');
    expect(previewHref('/a', 'staging', 'published')).toBe(
      '/a?site-editor-preview=1&site-editor-env=staging&site-editor-version=published',
    );
  });
});

describe('page browser markup', () => {
  const pages = mergeEnvironments(
    [summary('/content-creator', 'course'), summary('/privacy-policy', 'landing')],
    [
      summary('/content-creator', 'course', { hasDraft: true }),
      summary('/privacy-policy', 'landing'),
      summary('/flash-without-fear', 'workshop'),
    ],
    { '/privacy-policy': 'changed', '/flash-without-fear': 'new' },
  );
  const render = (target: 'staging' | 'production', initialPath?: string) =>
    load(
      renderToStaticMarkup(
        createElement(SitePageBrowser, {
          pages,
          environments: ['staging', 'production'],
          target,
          initialPath,
          disabled: false,
          onTarget: () => {},
          onOpen: () => {},
          onPublishToProduction: () => {},
        }),
      ),
    );

  it('lists pages by section with a state per environment', () => {
    const $ = render('staging');
    expect(
      $('nav h2')
        .map((_, el) => $(el).text())
        .get(),
    ).toEqual(['Курси 1', 'Воркшопи та інтенсиви 1', 'Юридичні документи 1']);
    const flash = $('li button').filter((_, el) => $(el).text().includes('/flash-without-fear'));
    expect(
      flash
        .find('[role=img]')
        .map((_, el) => $(el).attr('aria-label'))
        .get(),
    ).toEqual(['Staging: Опубліковано', 'Prod: Немає']);
    // A page needing attention is selected first: the course has a staging draft.
    expect($('#site-page-detail').text()).toBe('/content-creator');
  });

  it('previews the selected environment and offers publication to Prod', () => {
    let $ = render('staging', '/privacy-policy');
    // Without a draft the preview shows the published staging version.
    expect($('iframe').attr('src')).toBe(
      '/privacy-policy?site-editor-preview=1&site-editor-env=staging&site-editor-version=published',
    );
    expect($('iframe').attr('sandbox')).toBe('allow-same-origin');
    expect(
      $('article button')
        .map((_, el) => $(el).text().trim())
        .get(),
    ).toContain('Опублікувати на Prod');
    $ = render('production', '/flash-without-fear');
    expect($('iframe')).toHaveLength(0);
    expect($('article').text()).toContain('На Prod цієї сторінки немає');
    expect($('article button:contains("Редагувати на Prod")').is(':disabled')).toBe(true);
  });

  it('points the staging editor to the main admin', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteContentEditor, {
          initialPages: [summary('/a', 'landing')],
          writable: true,
          sync: 'staging',
        }),
      ),
    );
    expect($('a:contains("Відкрити основну адмінку")').attr('href')).toBe(
      'https://prophotoacademy.com.ua/admin/content',
    );
  });
});
