import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { studioHomeWorks } from '../src/lib/studio-home/selectors';
import { studioAssets } from '../src/lib/studio-design/assets';
import { StudioHomeWorks } from '../src/components/organisms/StudioHomeWorks/StudioHomeWorks';
import { StudioSpacesGallery } from '../src/components/organisms/StudioSpacesGallery/StudioSpacesGallery';
import { StudioIntensiveTemplate } from '../src/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';
import { StudioProgramTemplate } from '../src/components/templates/StudioProgramTemplate/StudioProgramTemplate';
import { Gallery } from '../src/components/organisms/Gallery/Gallery';
import { ImageGalleryDialog } from '../src/components/molecules/ImageGalleryDialog/ImageGalleryDialog';

const content = fixture as AcademyContent;
afterEach(() => vi.unstubAllEnvs());

describe('student-work popup coverage', () => {
  it('makes all 16 homepage photographs semantic popup triggers in the displayed order', () => {
    const $ = load(
      renderToStaticMarkup(createElement(StudioHomeWorks, { works: studioHomeWorks })),
    );
    const triggers = $('[aria-label="Роботи студентів"] button[aria-haspopup="dialog"]');
    expect(triggers).toHaveLength(16);
    expect(triggers.map((_, button) => $(button).find('img').attr('alt')).get()).toEqual(
      studioHomeWorks.map((work) => work.alt),
    );
    expect(triggers.filter('[type="button"]')).toHaveLength(16);
    expect(triggers.find('a')).toHaveLength(0);
    expect($('[aria-roledescription="карусель"] > [role="group"]')).toHaveLength(4);
    expect($('dialog.gallery-dialog')).toHaveLength(1);
    expect($('dialog [aria-live="polite"]').text()).toContain('1/16');
  });

  it('uses one four-image popup for AI Artwork, keeping its label distinct from student work', () => {
    const $ = load(renderToStaticMarkup(createElement(StudioIntensiveTemplate, { content })));
    const rail = $('[role="region"][aria-label="Роботи AI artwork"]');
    expect(rail.find('button[aria-haspopup="dialog"]')).toHaveLength(4);
    expect($('dialog.gallery-dialog')).toHaveLength(1);
    expect($('dialog').attr('aria-label')).toBe('Роботи AI artwork');
    expect($('dialog [aria-live="polite"]').text()).toContain('1/4');
    expect($('dialog img').attr('alt')).toBe(rail.find('img').first().attr('alt'));
  });

  it.each(['visual-content', 'food-product-photography', 'course-smm-instagram'])(
    'keeps %s works scoped to that program and connected to the same popup',
    (slug) => {
      const program = content.programs.find((item) => item.slug === slug)!;
      const $ = load(
        renderToStaticMarkup(createElement(StudioProgramTemplate, { program, content })),
      );
      const works = program.workIds.map((id) => content.works.find((work) => work.id === id)!);
      const buttons = $('#student-works .work-grid button[aria-haspopup="dialog"]');
      expect(buttons).toHaveLength(works.length);
      expect(buttons.map((_, button) => $(button).attr('aria-label')).get()).toEqual(
        works.map((work) => `Відкрити роботу: ${work.title}`),
      );
      expect($('#student-works dialog.gallery-dialog')).toHaveLength(1);
      expect($('#student-works dialog [aria-live="polite"]').text()).toContain(`1/${works.length}`);
    },
  );

  it('keeps the card title and image alt without captions in the popup', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(Gallery, { works: content.works, images: content.images }),
      ),
    );
    const first = content.works[0];
    const image = content.images.find((item) => item.id === first.imageId)!;
    expect($('.work-grid button[aria-haspopup="dialog"]')).toHaveLength(content.works.length);
    expect($('.work-item figcaption').first().text()).toContain(first.title);
    expect($('dialog').text().trim()).toBe(`1/${content.works.length}`);
    expect($('dialog img').attr('alt')).toBe(image.alt);
  });

  it('does not convert room photography into mislabeled student-work popups', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioSpacesGallery, {
          label: 'Зал Space',
          images: [{ asset: studioAssets.studio.imgImgMakeup1, alt: 'Гримерка студії' }],
        }),
      ),
    );
    expect($('[role="region"] > img')).toHaveLength(1);
    expect($('[role="region"] button, dialog')).toHaveLength(0);
  });

  it('keeps review-path assets valid in the extracted homepage popup', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/Prophotoacademy');
    const $ = load(
      renderToStaticMarkup(createElement(StudioHomeWorks, { works: studioHomeWorks })),
    );
    const src = $('dialog img').attr('src')!;
    expect(decodeURIComponent(src)).toContain(`/Prophotoacademy${studioHomeWorks[0].image.src}`);
    expect(decodeURIComponent(src)).not.toContain('/Prophotoacademy/Prophotoacademy/');
  });

  it('renders the selected photograph with stable shared chrome, accessible controls and no native image drag', () => {
    const images = content.works.slice(0, 2).map((work) => ({
      ...content.images.find((item) => item.id === work.imageId)!,
      id: work.id,
      title: work.title,
    }));
    const $ = load(
      renderToStaticMarkup(
        createElement(ImageGalleryDialog, {
          images,
          index: 1,
          dialogRef: { current: null },
          onNavigate: vi.fn(),
        }),
      ),
    );
    expect($('dialog.gallery-dialog').attr('open')).toBeUndefined();
    expect($('dialog img.lightbox-image').attr('alt')).toBe(images[1].alt);
    expect($('dialog img').attr('draggable')).toBe('false');
    expect(
      $('dialog button')
        .map((_, button) => $(button).attr('aria-label'))
        .get(),
    ).toEqual(['Закрити фото', 'Попереднє фото', 'Наступне фото']);
    expect($('dialog [aria-live="polite"]').text()).toContain('2/2');
  });
});
