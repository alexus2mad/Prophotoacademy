import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SiteEditorField } from '@/components/molecules/SiteEditorField/SiteEditorField';
import { SiteBlockLibrary } from '@/components/molecules/SiteBlockLibrary/SiteBlockLibrary';
import { SiteBlockInspector } from '@/components/organisms/SiteBlockInspector/SiteBlockInspector';
import { SitePageCreate } from '@/components/molecules/SitePageCreate/SitePageCreate';
import { addBlockItem, blockLibrary, createBlock, itemFieldId } from '@/lib/site-editor/blocks';
import { pageTemplates } from '@/lib/site-editor/templates';
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
            onInsertAt: () => {},
            onMoveTo: () => {},
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

  it('opens the shared photo library for the specific field and shows the current photo', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteEditorField, {
          field: page.sections[0].fields[1],
          disabled: false,
          removable: false,
          onChooseImage: () => {},
          onStyle: () => {},
          onChange: () => {},
        }),
      ),
    );
    expect($('img').attr('src')).toBe('/images/workshop.webp');
    expect($('button').attr('aria-label')).toContain('Замінити зображення · Світлина');
    expect($('details')).toHaveLength(0);
  });

  it('names every block and indicates where the choice will be inserted', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteBlockLibrary, {
          locationLabel: 'Після блоку «Вступ»',
          onChoose: () => {},
          onClose: () => {},
        }),
      ),
    );
    expect($('dialog').attr('aria-labelledby')).toBe($('h2').attr('id'));
    expect($('dialog p').text()).toContain('Після блоку «Вступ»');
    expect(
      $('button strong')
        .map((_, el) => $(el).text())
        .get(),
    ).toEqual(blockLibrary.map((b) => b.label));
  });

  it('presents the available templates with a single initial selection', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SitePageCreate, { busy: false, onCreate: () => {}, onCancel: () => {} }),
      ),
    );
    const radios = $('input[type=radio][name=page-template]');
    expect(radios.map((_, el) => $(el).attr('value')).get()).toEqual(
      pageTemplates.map((t) => t.id),
    );
    expect(radios.filter('[checked]').attr('value')).toBe('blank');
    expect(radios.parent().text()).toContain('Воркшоп');
    expect(radios.parent().text()).toContain('Практичний інтенсив');
  });

  it('selects a slide by stable field identity and protects the list boundaries', () => {
    const section = addBlockItem(createBlock('carousel'));
    const last = section.itemIds![1];
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteBlockInspector, {
          section,
          fieldId: itemFieldId(last, 'caption'),
          disabled: false,
          removableImages: true,
          onSelectField: () => {},
          onChange: () => {},
          onStyle: () => {},
          onChooseImage: () => {},
          onAddItem: () => {},
          onRemoveItem: () => {},
          onMoveItem: () => {},
        }),
      ),
    );
    expect($('section[aria-label="Слайди каруселі"] select').first().val()).toBe(last);
    expect($('button[aria-label^="Перемістити нижче"]').is(':disabled')).toBe(true);
    expect($('button[aria-label^="Перемістити вище"]').is(':disabled')).toBe(false);
    expect($('details summary[aria-label*=Підпис]')).toHaveLength(1);
    expect($('summary[aria-label*="Опис фотографії"]')).toHaveLength(0);
  });

  it.each([
    ['intensive-program', 'Теми програми', 'Додати тему', 'title'],
    ['intensive-gallery', 'Фотографії галереї', 'Додати фотографію', 'alt'],
    ['intensive-format', 'Особливості заняття', 'Додати особливість', 'title'],
  ] as const)(
    'edits ordered %s items through a named selector and accessible actions',
    (type, group, add, key) => {
      const section = addBlockItem(createBlock(type));
      const second = section.itemIds![1];
      const fieldId = itemFieldId(second, key);
      section.fields.find((f) => f.id === fieldId)!.value = 'Другий приклад';
      const noop = () => {};
      const $ = load(
        renderToStaticMarkup(
          createElement(SiteBlockInspector, {
            section,
            fieldId,
            disabled: false,
            removableImages: true,
            onSelectField: noop,
            onChange: noop,
            onStyle: noop,
            onChooseImage: noop,
            onAddItem: noop,
            onRemoveItem: noop,
            onMoveItem: noop,
          }),
        ),
      );
      const list = $('section[aria-label="' + group + '"]');
      expect(list.find('select').first().val()).toBe(second);
      expect(list.find('option:selected').text()).toContain('2 · Другий приклад');
      expect(list.find('button').first().text()).toBe(add);
      expect(list.find('button[aria-label^="Перемістити вище"]').is(':disabled')).toBe(false);
    },
  );

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

  it.each(['intensive-intro', 'intensive-offer'] as const)(
    'uses the bound ticket price and currency in the %s inspector',
    (type) => {
      const section = createBlock(type);
      section.fields.find((f) => f.id === 'price')!.value = '1';
      const noop = () => {};
      const inspector = {
        section,
        fieldId: 'heading',
        disabled: false,
        removableImages: true,
        onSelectField: noop,
        onChange: noop,
        onStyle: noop,
        onChooseImage: noop,
        onAddItem: noop,
        onRemoveItem: noop,
        onMoveItem: noop,
      };
      const unbound = load(renderToStaticMarkup(createElement(SiteBlockInspector, inspector)));
      expect(unbound('#editor-field-price').val()).toBe('1');
      const bound = load(
        renderToStaticMarkup(
          createElement(SiteBlockInspector, {
            ...inspector,
            ticket: { amount: 4200, currency: 'грн', price: '4 200', href: '/checkout' },
          }),
        ),
      );
      expect(bound('dd').text()).toBe('4 200 грн');
      expect(bound('#editor-field-price, #editor-field-currency')).toHaveLength(0);
    },
  );
});
