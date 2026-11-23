// @vitest-environment jsdom
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { connectPreviewFrame } from '@/components/molecules/SiteEditorPreview/frame';
import { MarketingBlock } from '@/components/molecules/MarketingBlock/MarketingBlock';
import { newSitePage } from '@/lib/site-editor/fields';
import { createBlock, itemFieldId } from '@/lib/site-editor/blocks';

describe('live composition iframe', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML =
      '<main><section data-site-section="landing-cover"><h1 data-site-field="title">Курс</h1></section><div data-site-composition="/test"></div></main>';
  });
  it('selects a newly inserted slide photo by stable identity and applies and resets a native style without reloading', () => {
    const savedPage = newSitePage('/test', 'Курс', 'landing');
    const page = structuredClone(savedPage);
    const slide = createBlock('carousel');
    page.sections.push(slide);
    const photoId = itemFieldId(slide.itemIds![0], 'image');
    const replace = vi.fn(),
      select = vi.fn();
    const host = document.querySelector('[data-site-composition]')!;
    const frame = connectPreviewFrame(
      document,
      () => ({
        savedPage,
        page,
        sectionId: slide.id,
        version: 0,
        editable: true,
        onSelect: select,
        onChange: vi.fn(),
        onReplaceImage: replace,
      }),
      select,
    );
    try {
      host.innerHTML = renderToStaticMarkup(
        createElement(MarketingBlock, { section: slide, editing: true }),
      );
      const photo = host.querySelector<HTMLElement>('[data-canvas-field="image"]')!;
      photo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(replace).toHaveBeenCalledWith({ sectionId: slide.id, fieldId: photoId });
      expect(select).toHaveBeenCalledWith({ sectionId: slide.id, fieldId: photoId });
      page.sections[0].fields[0].style = { color: 'accent' };
      frame.sync();
      expect(document.head.textContent).toContain('color:#c6302a!important');
      delete page.sections[0].fields[0].style;
      frame.sync();
      expect(document.head.textContent).not.toContain('color:#c6302a!important');
    } finally {
      frame.disconnect();
    }
  });
});
