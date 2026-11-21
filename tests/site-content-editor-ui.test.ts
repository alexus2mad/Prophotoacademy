import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SiteEditorField } from '@/components/molecules/SiteEditorField/SiteEditorField';
import { SiteEditorPreview } from '@/components/molecules/SiteEditorPreview/SiteEditorPreview';
import { textEditCommand } from '@/components/molecules/SiteEditorPreview/text-control';
import { previewIndex } from '@/components/molecules/SiteEditorPreview/match';
import { SiteContentEditor } from '@/components/organisms/SiteContentEditor/SiteContentEditor';
import type { SitePage } from '@/lib/site-editor/types';

const page: SitePage = {
  path: '/workshop-example',
  kind: 'workshop',
  title: 'Воркшоп',
  sections: [
    {
      id: 'hero',
      label: 'Обкладинка',
      fields: [
        { id: 'title', kind: 'text', label: 'Заголовок', value: 'Більше світла' },
        { id: 'photo', kind: 'image', label: 'Світлина', value: '/images/workshop.webp' },
      ],
    },
    {
      id: 'body',
      label: 'Програма',
      fields: [{ id: 'heading', kind: 'text', label: 'Підзаголовок', value: 'БІЛЬШЕ   СВІТЛА' }],
    },
  ],
};

describe('Site content editor', () => {
  it('retains native multiline and composing input while supporting accessible edit shortcuts', () => {
    const enter = { key: 'Enter', keyCode: 13, isComposing: false, ctrlKey: false, metaKey: false };
    expect(textEditCommand(enter, false)).toBeUndefined();
    expect(textEditCommand(enter, true)).toBe('commit');
    expect(textEditCommand({ ...enter, metaKey: true }, false)).toBe('commit');
    expect(textEditCommand({ ...enter, ctrlKey: true }, false)).toBe('commit');
    expect(textEditCommand({ ...enter, key: 'Escape' }, false)).toBe('cancel');
    expect(textEditCommand({ ...enter, key: 'Tab' }, true)).toBe('tab');
    expect(textEditCommand({ ...enter, isComposing: true }, true)).toBeUndefined();
    expect(textEditCommand({ ...enter, keyCode: 229 }, true)).toBeUndefined();
  });
  it('identifies a readonly library and preserves the page picker', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteContentEditor, {
          initialPages: [
            {
              path: page.path,
              title: page.title,
              kind: page.kind,
              hasDraft: false,
              published: true,
            },
          ],
          writable: false,
        }),
      ),
    );
    expect($('p[role=status]').text()).toContain('Режим перегляду');
    expect($('header button').is(':disabled')).toBe(true);
    expect($('li button').is(':disabled')).toBe(false);
    expect($('li').text()).toContain('Опубліковано');
  });

  it.each([false, true])(
    'keeps the preview sandboxed and accurately explains editability (%s)',
    (editable) => {
      const $ = load(
        renderToStaticMarkup(
          createElement(SiteEditorPreview, {
            page,
            savedPage: page,
            sectionId: 'hero',
            version: 0,
            editable,
            onSelect: () => {},
            onChange: () => {},
            onReplaceImage: () => {},
          }),
        ),
      );
      expect($('iframe').attr('sandbox')).toBe('allow-same-origin');
      expect($('iframe').attr('src')).toBe(page.path + '?site-editor-preview=1');
      expect($('p').text()).toBe(
        editable
          ? 'Натисніть на текст, щоб його змінити, або на фото, щоб замінити зображення'
          : 'Перегляд сторінки',
      );
    },
  );

  it('labels the real upload input and shows its existing photograph', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteEditorField, {
          field: page.sections[0].fields[1],
          disabled: false,
          removable: false,
          onUpload: () => {},
          onChange: () => {},
        }),
      ),
    );
    expect($('img').attr('src')).toBe('/images/workshop.webp');
    expect($('label').attr('for')).toBe($('input[type=file]').attr('id'));
    expect($('input[type=file]').attr('accept')).toContain('image/avif');
    expect($('button').length).toBe(0);
  });

  it('retains duplicate matches for disambiguation when inspecting the saved preview', () => {
    const index = previewIndex(page, 'https://example.test');
    expect(index.get('більше світла')).toEqual([
      { sectionId: 'hero', fieldId: 'title' },
      { sectionId: 'body', fieldId: 'heading' },
    ]);
    expect(index.get('https://example.test/images/workshop.webp')).toEqual([
      { sectionId: 'hero', fieldId: 'photo' },
    ]);
  });
});
