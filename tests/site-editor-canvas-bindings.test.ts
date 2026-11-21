// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { bindPreviewFields } from '@/components/molecules/SiteEditorPreview/match';
import { siteField, siteSection } from '@/lib/site-editor/fields';
import type { SitePage, SiteSection } from '@/lib/site-editor/types';

function page(...sections: SiteSection[]): SitePage {
  return { path: '/example', title: 'Приклад', kind: 'landing', sections };
}

function render(markup: string, model: SitePage) {
  document.body.innerHTML = '<main>' + markup + '</main>';
  return bindPreviewFields(document, model);
}

describe('editable preview field identity', () => {
  it('distinguishes repeated visible labels by their authored section and field and skips ambiguous copy', () => {
    const model = page(
      siteSection('intro', 'Вступ', [
        siteField('title', 'Назва', 'Практика'),
        siteField('action', 'Кнопка', 'Практика'),
      ]),
      siteSection('body', 'Зміст', [siteField('heading', 'Заголовок', 'Практика')]),
    );
    const fields = render(
      `
      <section data-site-section="intro">
        <h1 data-site-field="title">Практика</h1>
        <a href="/learning" data-site-field="action">Практика</a>
        <small>Практика</small>
      </section>
      <h2 data-site-section="body">Практика</h2>
      <aside>Практика</aside>`,
      model,
    );
    expect([...fields.values()]).toEqual([
      { sectionId: 'intro', fieldId: 'title' },
      { sectionId: 'intro', fieldId: 'action' },
      { sectionId: 'body', fieldId: 'heading' },
    ]);
  });

  it('keeps neighboring script-styled words, whitespace and icon markup intact', () => {
    const fields = render(
      '<h1> Бачити <em>більше</em> <i aria-hidden="true">→</i></h1>',
      page(
        siteSection('intro', 'Вступ', [
          siteField('a', 'Початок', 'Бачити'),
          siteField('b', 'Акцент', 'більше'),
        ]),
      ),
    );
    const [lead, accent] = fields.keys();
    lead.textContent = 'Знімати';
    expect(accent.tagName).toBe('EM');
    expect(document.querySelector('h1')!.textContent).toBe(' Знімати більше →');
    expect(document.querySelector('h1 i')).not.toBeNull();
  });

  it('resolves the displayed art direction even when desktop and phone use the very same source', () => {
    const model = page(
      siteSection('cover', 'Обкладинка', [
        siteField('wide', 'Широка', '/shared.webp', 'image'),
        siteField('phone', 'Телефон', '/shared.webp', 'image'),
      ]),
    );
    const markup =
      '<picture data-site-section="cover"><source media="(max-width: 760px)" srcset="/shared.webp" data-site-field="phone"><img data-site-field="wide" src="/shared.webp"></picture>';
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    try {
      expect([...render(markup, model).values()]).toEqual([
        { sectionId: 'cover', fieldId: 'phone' },
      ]);
      vi.stubGlobal('matchMedia', () => ({ matches: false }));
      expect([...bindPreviewFields(document, model).values()]).toEqual([
        { sectionId: 'cover', fieldId: 'wide' },
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('maps optimized and prepared images back to the editorial source without using alt as a text field', () => {
    const fields = render(
      '<img src="/_next/image?url=%2Fphoto.webp&amp;w=800&amp;q=75"><img src="/resized-960.webp" data-site-image-source="/original.webp"><p>Фото</p>',
      page(
        siteSection('intro', 'Вступ', [
          siteField('image', 'Фото', '/photo.webp', 'image'),
          siteField('prepared', 'Портрет', '/original.webp', 'image'),
          siteField('image-alt', 'Опис', 'Фото'),
        ]),
      ),
    );
    expect([...fields.values()]).toEqual([
      { sectionId: 'intro', fieldId: 'image' },
      { sectionId: 'intro', fieldId: 'prepared' },
    ]);
  });

  it('does not guess when one editable value also appears in an unrelated part of the rendered page', () => {
    const model = page(siteSection('intro', 'Вступ', [siteField('heading', 'Назва', 'Світло')]));
    expect(render('<h1>Світло</h1><h2>Світло</h2>', model).size).toBe(0);
    const fields = render(
      '<h1 data-site-section="intro" data-site-field="heading">Світло</h1><h2>Світло</h2>',
      model,
    );
    expect([...fields.keys()].map((node) => node.tagName)).toEqual(['H1']);
  });

  it('leaves navigation, commercial terms, unavailable carousel images and forms inert on identical copy', () => {
    const model = page(
      siteSection('intro', 'Вступ', [
        siteField('title', 'Назва', 'Практика'),
        siteField('image', 'Фото', '/shared.webp', 'image'),
      ]),
    );
    const fields = render(
      `<h1>Практика</h1><nav><a>Практика</a></nav>
      <a href="/checkout/ticket">Практика</a><p data-site-locked>Практика</p><form><label>Практика</label></form>
      <div data-hero-visual="shop" data-active="false"><img src="/shared.webp"></div>`,
      model,
    );
    expect([...fields.keys()].map((e) => e.tagName)).toEqual(['H1']);
  });

  it('keeps all paragraphs of a landing together when editing its single prose field', () => {
    const text = 'Перший абзац\n\nДругий абзац';
    const model = page(
      siteSection('body', 'Текст', [siteField('copy', 'Вміст', text, 'multiline')]),
    );
    const fields = render(
      '<section data-site-section="body"><p data-site-paragraph="copy">Перший абзац</p><p data-site-paragraph="copy">Другий абзац</p></section>',
      model,
    );
    expect([...fields.values()]).toEqual([{ sectionId: 'body', fieldId: 'copy' }]);
    expect([...fields.keys()][0].textContent).toBe(text);
  });
});
