import { existsSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { getContent } from '../src/lib/content';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import Detail from '../src/app/(academy)/[slug]/page';
import { StudioCreatorTemplate } from '../src/components/templates/StudioCreatorTemplate/StudioCreatorTemplate';
import { creatorEditorial } from '../src/lib/studio-creator/content';
import { creatorWorks } from '../src/components/organisms/StudioCreatorWorks/selectors';
import { creatorAssets } from '../src/lib/studio-creator/assets';

vi.mock('../src/lib/content', () => ({ getContent: vi.fn() }));
vi.mock('../src/lib/commerce/catalog', () => ({ enrollmentOptions: vi.fn() }));
vi.mock('next/server', () => ({ connection: vi.fn() }));

const content = fixture as AcademyContent;
const program = content.programs.find((item) => item.id === 'program-commercial')!;
const offering = content.offerings.find((item) => item.programId === program.id)!;
const works = program.workIds.flatMap((id) => content.works.find((work) => work.id === id) ?? []);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studio');
  vi.mocked(getContent).mockResolvedValue(content);
  vi.mocked(enrollmentOptions).mockResolvedValue({ mode: 'wayforpay', packageIds: [] });
});
afterEach(() => vi.unstubAllEnvs());

describe('Content Creator route and commercial boundaries', () => {
  it('selects the new course design only for the commercial course in the studio variant', async () => {
    const commercial = load(
      renderToStaticMarkup(await Detail({ params: Promise.resolve({ slug: program.slug }) })),
    );
    expect(commercial('[data-course-design="creator"]')).toHaveLength(1);
    expect(commercial('h1')).toHaveLength(1);
    for (const id of ['program-visual', 'program-instagram']) {
      const other = content.programs.find((item) => item.id === id)!;
      const html = renderToStaticMarkup(
        await Detail({ params: Promise.resolve({ slug: other.slug }) }),
      );
      expect(load(html)('[data-course-design="creator"]')).toHaveLength(0);
    }
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'legacy');
    const legacy = renderToStaticMarkup(
      await Detail({ params: Promise.resolve({ slug: program.slug }) }),
    );
    expect(load(legacy)('[data-course-design="creator"]')).toHaveLength(0);
  });

  it.each(['disabled', 'mock', 'wayforpay'] as const)(
    'keeps closed enrollment closed in %s mode, including stale available package IDs',
    (mode) => {
      const closedContent = {
        ...content,
        offerings: content.offerings.map((item) =>
          item.id === offering.id ? { ...item, availability: 'closed' as const } : item,
        ),
      };
      const $ = load(
        renderToStaticMarkup(
          createElement(StudioCreatorTemplate, {
            program,
            editorial: creatorEditorial,
            content: closedContent,
            enrollment: {
              mode,
              packageIds: offering.packages.map((pack) => pack.id),
              lessonTitles: { 'commercial-base': ['Private lesson title'] },
            },
          }),
        ),
      );
      expect($('a[href^="/checkout"]')).toHaveLength(0);
      expect($('[data-installment-methods]')).toHaveLength(0);
      expect($.text()).toContain('Набір закрито');
      expect($.text()).toContain('Наступний набір');
      expect($.text()).not.toContain('Private lesson title');
      expect($.text()).not.toContain('Отримати доступ');
      expect($('.package-grid .package-card')).toHaveLength(offering.packages.length);
      expect(
        $('.package-grid .price-amount')
          .map((_, element) => Number($(element).text().replace(/\s/g, '')))
          .get(),
      ).toEqual(offering.packages.map((pack) => pack.price));
      expect($('.package-grid .package-card[data-featured="true"] h3').text()).toBe('GOLD');
      expect($.text()).not.toMatch(/Старт 27\.11|Лишилось 2 місця|До 20 місць|25\s*500|70\s*000/);
    },
  );

  it('uses server-authorized offer and package IDs when sales reopen, retaining excluded packages as inquiries', () => {
    const openOffering = { ...offering, availability: 'open' as const, joiningOpen: true };
    const enabledIds = openOffering.packages.slice(0, 2).map((pack) => pack.id);
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioCreatorTemplate, {
          program,
          editorial: creatorEditorial,
          content: { ...content, offerings: [openOffering] },
          enrollment: { mode: 'wayforpay', packageIds: enabledIds },
        }),
      ),
    );
    const checkoutUrls = $('.package-grid a[href^="/checkout"]')
      .map((_, element) => new URL($(element).attr('href')!, 'https://academy.example'))
      .get();
    expect(checkoutUrls.map((url) => url.searchParams.get('package'))).toEqual(enabledIds);
    expect(checkoutUrls.every((url) => url.searchParams.get('offering') === offering.id)).toBe(
      true,
    );
    expect(checkoutUrls.every((url) => !url.searchParams.has('price'))).toBe(true);
    expect($('#program-about [data-installment-methods="prominent"]')).toHaveLength(1);
    expect($('.package-grid [data-installment-methods="compact"]')).toHaveLength(2);
    expect($('.package-grid article').last().find('[data-installment-methods]')).toHaveLength(0);
    expect($('.package-grid article').last().find('button[aria-haspopup="dialog"]')).toHaveLength(
      1,
    );
  });
});

describe('Content Creator learning outline and work sources', () => {
  it('exposes the real curriculum through one initially collapsed native disclosure', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioCreatorTemplate, { program, editorial: creatorEditorial, content }),
      ),
    );
    const disclosure = $('#program-curriculum > details');
    expect(disclosure).toHaveLength(1);
    expect(disclosure.attr('open')).toBeUndefined();
    expect(disclosure.children('summary').text()).toContain('Ознайомитись з програмою');
    expect(
      disclosure
        .find('h3')
        .map((_, element) => $(element).text())
        .get(),
    ).toEqual(program.modules.map((module) => module.title));
    for (const module of program.modules) {
      for (const topic of module.topics) expect(disclosure.text()).toContain(topic);
    }
    const heroActions = $('[aria-labelledby="creator-title"] .studio-actions a');
    expect(heroActions).toHaveLength(2);
    expect(heroActions.first().attr('href')).toBe('#packages');
    expect(heroActions.first().text()).toBe('Хочу на курс→');
    expect(heroActions.first().parent().attr('class')).toContain('desktopAction');
    expect(heroActions.last().attr('href')).toBe('#program-curriculum');
    expect(heroActions.last().text()).toBe('Програма');
  });

  it('preserves every scoped work and its device when applying the approved opening sequence', () => {
    const entries = creatorWorks({
      works,
      images: content.images,
      opening: creatorEditorial.worksOpening,
    });
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    for (const work of works) {
      const original = content.images.find((image) => image.id === work.imageId)!;
      expect(entries.find((entry) => entry.id === work.id)).toMatchObject({
        src: original.src,
        device: work.device,
        alt: original.alt,
      });
    }
    expect(
      entries.filter((entry) => !program.workIds.includes(entry.id)).map((entry) => entry.src),
    ).toEqual([creatorAssets.monochrome.src, creatorAssets.curly.src]);
    const camera = entries.filter((entry) => entry.device === 'camera');
    const phone = entries.filter((entry) => entry.device === 'phone');
    expect(phone).toHaveLength(works.filter((work) => work.device === 'phone').length);
    expect(camera.length + phone.length).toBe(entries.length);
    expect(camera.length).toBeGreaterThan(0);
    expect(phone.length).toBeGreaterThan(0);
  });

  it('connects the filtered default rail and its actual count to the existing captionless popup', () => {
    const camera = creatorWorks({
      works,
      images: content.images,
      opening: creatorEditorial.worksOpening,
    }).filter((entry) => entry.device === 'camera');
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioCreatorTemplate, { program, editorial: creatorEditorial, content }),
      ),
    );
    const rail = $('#creator-work-rail');
    const triggers = rail.children('button[aria-haspopup="dialog"]');
    expect(triggers).toHaveLength(camera.length);
    expect(
      triggers
        .find('img')
        .map((_, element) => $(element).attr('alt'))
        .get(),
    ).toEqual(camera.map((entry) => entry.alt));
    const portrait = triggers.find('img').filter((_, image) => {
      return decodeURIComponent($(image).attr('src') ?? '').includes(creatorAssets.curly.src);
    });
    expect(portrait).toHaveLength(1);
    expect(portrait.attr('width')).toBe('1080');
    expect(portrait.attr('height')).toBe('1440');
    expect(portrait.attr('style')).toContain('object-fit:contain');
    expect(
      $('#student-works [aria-controls="creator-work-rail"][aria-pressed="true"]').text(),
    ).toBe('На камеру');
    expect(
      $('#student-works [aria-controls="creator-work-rail"][aria-pressed="false"]').text(),
    ).toBe('На телефон');
    expect($('#student-works dialog')).toHaveLength(1);
    expect($('#student-works dialog').text().trim()).toBe(`1/${camera.length}`);
    expect($('#student-works dialog img').attr('alt')).toBe(camera[0].alt);
    expect(
      $('#student-works dialog button')
        .map((_, element) => $(element).attr('aria-label'))
        .get(),
    ).toEqual(['Закрити фото', 'Попереднє фото', 'Наступне фото']);
  });

  it('keeps page and popup assets inside the review base path and backed by local files', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/Prophotoacademy');
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioCreatorTemplate, { program, editorial: creatorEditorial, content }),
      ),
    );
    const sources = $('img')
      .map((_, element) => {
        const src = $(element).attr('src')!;
        const url = new URL(src, 'https://academy.example');
        return url.searchParams.get('url') ?? url.pathname;
      })
      .get();
    for (const src of sources) {
      expect(src, `Asset lacks review base path: ${src}`).toMatch(/^\/Prophotoacademy\//);
      expect(src).not.toContain('/Prophotoacademy/Prophotoacademy/');
      expect(
        existsSync(path.join(process.cwd(), 'public', src.replace('/Prophotoacademy/', ''))),
        src,
      ).toBe(true);
    }
  });
});
