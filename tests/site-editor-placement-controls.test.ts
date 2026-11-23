import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it, vi } from 'vitest';
import { SitePreviewSlot } from '@/components/molecules/SitePreviewSlot/SitePreviewSlot';
import { SiteMoveBlockDialog } from '@/components/molecules/SiteMoveBlockDialog/SiteMoveBlockDialog';
import { createBlock } from '@/lib/site-editor/blocks';
import { newSitePage } from '@/lib/site-editor/fields';
import { addBlockAt } from '@/lib/site-editor/block-position';

describe('preview placement controls', () => {
  const first = createBlock('heading');
  first.fields[0].value = 'Вступ';
  const second = createBlock('paragraph');
  second.fields[0].value = 'Текст для студента';
  const slot = 'landing-cover';
  const before = addBlockAt(newSitePage('/landing', 'Практика', 'landing'), first, { slot });
  const page = addBlockAt(before, second, { slot });

  it('renders a named, keyboard-operable insertion point before each block and at the end of this location', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SitePreviewSlot, {
          slot,
          label: 'Перший екран',
          blocks: [first, second],
          editable: true,
          selected: first.id,
          onInsert: vi.fn(),
          onChooseMove: vi.fn(),
        }),
      ),
    );
    const controls = $('[data-canvas-boundary]');
    expect(controls).toHaveLength(3);
    expect(controls.map((_, el) => $(el).attr('data-canvas-before') || 'end').get()).toEqual([
      first.id,
      second.id,
      'end',
    ]);
    expect(controls.first().attr('aria-label')).toContain(
      'Перед розділом «Перший екран» · перед блоком «Заголовок · Вступ»',
    );
    expect($('button[data-canvas-grip]')).toHaveLength(2);
  });

  it('renders the content without manipulation controls when saving or read-only', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SitePreviewSlot, {
          slot,
          label: 'Перший екран',
          blocks: [first, second],
          editable: false,
          selected: first.id,
          onInsert: vi.fn(),
          onChooseMove: vi.fn(),
        }),
      ),
    );
    expect($('[data-block-type]')).toHaveLength(2);
    expect($('[data-canvas-boundary],[data-canvas-grip],[data-canvas-block-bar]')).toHaveLength(0);
  });

  it('exposes every valid location and identifies the current position without treating a native section as a moveable block', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(SiteMoveBlockDialog, {
          page,
          block: page.sections.find((s) => s.id === first.id)!,
          onMove: vi.fn(),
          onClose: vi.fn(),
        }),
      ),
    );
    expect(
      $('select optgroup')
        .map((_, el) => $(el).attr('label'))
        .get(),
    ).toEqual([
      'Перед розділом «Перший екран»',
      'Перед розділом «Про програму»',
      'Кінець сторінки',
    ]);
    expect($('option:disabled')).toHaveLength(1);
    expect($('option:disabled').text()).toContain('Абзац · Текст для студента');
    expect($('button[type=submit]').is(':disabled')).toBe(true);
  });
});
