import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '@/lib/content/types';
import type { SitePage } from '@/lib/site-editor/types';
import { buildSiteSeeds } from '@/lib/site-editor/seed-model';
import { pagePlacements } from '@/lib/site-editor/placements';
import { createBlock } from '@/lib/site-editor/blocks';
import { newSitePage } from '@/lib/site-editor/fields';
import { readSitePage } from '@/lib/site-editor/public';
import Home from '@/app/(academy)/page';
import Academy from '@/app/(academy)/academy/page';
import Intensive from '@/app/(academy)/ai-artwork/page';
import Studio from '@/app/(academy)/photo-studio/page';
import Shop from '@/app/(academy)/shop/page';
import About from '@/app/(academy)/about-us/page';
import Contacts from '@/app/(academy)/contacts/page';
import Reviews from '@/app/(academy)/reviews/page';
import StudentWork from '@/app/(academy)/student-work/page';
import Detail from '@/app/(academy)/[slug]/page';

vi.mock('@/lib/content', () => ({
  getContent: async () => (await import('../content/academy.json')).default,
}));
vi.mock('@/lib/site-editor/public', () => ({
  readSitePage: vi.fn(),
  listNewSitePages: async () => [],
}));
vi.mock('@/lib/commerce/catalog', () => ({
  enrollmentOptions: async () => ({ mode: 'disabled', packageIds: [] }),
}));
vi.mock('@/lib/studio-design/variant', () => ({ academyDesign: () => 'studio' }));
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  connection: async () => {},
}));

const seeds = buildSiteSeeds(fixture as AcademyContent);
const routes = new Map([
  ['/', Home],
  ['/academy', Academy],
  ['/ai-artwork', Intensive],
  ['/photo-studio', Studio],
  ['/shop', Shop],
  ['/about-us', About],
  ['/contacts', Contacts],
  ['/reviews', Reviews],
  ['/student-work', StudentWork],
]);
afterEach(() => vi.mocked(readSitePage).mockReset());
async function render(page: SitePage) {
  vi.mocked(readSitePage).mockImplementation(async (path) =>
    path === page.path ? page : seeds.find((s) => s.path === path),
  );
  const route = routes.get(page.path);
  return load(
    renderToStaticMarkup(
      route
        ? await route({})
        : await Detail({ params: Promise.resolve({ slug: page.path.slice(1) }) }),
    ),
  );
}

describe('native marketing page placement boundaries', () => {
  it.each(seeds.map((s) => s.path))(
    'exposes all declared boundaries once and publishes matching HTML for %s',
    async (path) => {
      const page = structuredClone(seeds.find((seed) => seed.path === path)!);
      const slots = pagePlacements(page).map((slot) => slot.id);
      expect(slots.length).toBeGreaterThan(2);
      const blank = await render(page);
      expect(blank('[data-site-placement]')).toHaveLength(0);
      const preview = await render({ ...page, editorPreview: true });
      const ids = preview('[data-site-placement]')
        .map((_, node) => preview(node).attr('data-site-placement'))
        .get();
      expect(ids).toEqual(slots);
      for (const [i, slot] of slots.entries()) {
        const block = createBlock('heading');
        block.fields[0].value = 'Вставлено ' + i;
        block.placement = slot;
        page.sections.push(block);
      }
      const published = await render(page);
      expect(
        published('[data-site-placement]')
          .map((_, node) => published(node).attr('data-site-placement'))
          .get(),
      ).toEqual(slots);
      expect(
        published('[data-block-type="heading"] h2')
          .map((_, n) => published(n).text())
          .get(),
      ).toEqual(slots.map((_, i) => 'Вставлено ' + i));
      expect(published('[data-canvas-field]')).toHaveLength(0);
    },
  );
  it('places authored copy directly before its native section and preserves sibling order independently of the source array', async () => {
    const page = structuredClone(seeds.find((seed) => seed.path === '/about-us')!);
    const first = createBlock('paragraph'),
      second = createBlock('heading'),
      legacy = createBlock('heading'),
      retired = createBlock('heading');
    first.placement = second.placement = 'figures';
    retired.placement = 'removed-slot';
    page.sections.push(legacy, first, retired, second);
    const $ = await render(page);
    const slot = $('[data-site-placement="figures"]');
    expect(slot.next().attr('data-site-section')).toBe('figures');
    expect(slot.prev().attr('data-site-section')).toBe('intro');
    expect(
      slot
        .children()
        .map((_, n) => $(n).attr('data-site-section'))
        .get(),
    ).toEqual([first.id, second.id]);
    expect(
      $('[data-site-placement="end"]')
        .children()
        .map((_, n) => $(n).attr('data-site-section'))
        .get(),
    ).toEqual([legacy.id, retired.id]);
    expect($('[data-block-type]')).toHaveLength(4);
  });
  it('preserves existing editorial landing sections and places authored blocks at a native landing-body even when the original body is empty', async () => {
    const page = newSitePage('/qa-insertion', 'Програма', 'landing');
    page.sections.push({ ...structuredClone(page.sections[1]), id: 'landing-body-1' });
    const subtitle = page.sections[2].fields.find((f) => f.id === 'heading')!;
    subtitle.value = 'Третя секція';
    const first = createBlock('heading'),
      second = createBlock('heading');
    first.placement = 'landing-body';
    second.placement = 'landing-body-1';
    page.sections.push(second, first);
    const $ = await render(page);
    const found = $('article')
      .first()
      .children()
      .map((_, n) => $(n).attr('data-site-section') || $(n).attr('data-site-placement'))
      .get();
    expect(found).toEqual(['landing-cover', 'landing-body', 'landing-body-1', 'landing-body-1']);
    expect($('[data-site-placement="landing-body-1"]').next().find('h2').text()).toBe(
      subtitle.value,
    );
  });
});
