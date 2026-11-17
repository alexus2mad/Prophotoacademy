import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { useStudioHomeExperience } from '../src/components/organisms/StudioHomeExperience/hooks';
import { StudioHomeTemplate } from '../src/components/templates/StudioHomeTemplate/StudioHomeTemplate';

vi.mock('../src/components/organisms/StudioHomeExperience/hooks', () => ({
  useStudioHomeExperience: vi.fn(),
}));

const content = fixture as AcademyContent;

it.each(['academy', 'studio', 'shop'] as const)(
  'mounts only the selected %s homepage content under its own tab panel',
  (mode) => {
    vi.mocked(useStudioHomeExperience).mockReturnValue({
      mode,
      selectMode: vi.fn(),
      directionsRef: { current: null },
    });
    const $ = load(renderToStaticMarkup(createElement(StudioHomeTemplate, { content })));
    const panel = $(`#home-panel-${mode}`);
    expect($('[role="tab"][aria-selected="true"]').attr('aria-controls')).toBe(panel.attr('id'));
    expect($('[role="tabpanel"]:not([hidden])')).toHaveLength(1);
    expect(panel.attr('aria-labelledby')).toBe(`home-tab-${mode}`);
    expect($('[role="tabpanel"][hidden]').children()).toHaveLength(0);

    expect(panel.find('#education-id')).toHaveLength(mode === 'academy' ? 1 : 0);
    expect(panel.find('[data-home-section="exposure"]')).toHaveLength(mode === 'academy' ? 1 : 0);
    expect(panel.find('[data-home-section="works"]')).toHaveLength(mode === 'academy' ? 1 : 0);
    expect(panel.find('#spaces article')).toHaveLength(mode === 'studio' ? 3 : 0);
    expect(panel.find('#studio-booking')).toHaveLength(mode === 'studio' ? 1 : 0);
    expect(panel.find('#equipment-selection form')).toHaveLength(mode === 'shop' ? 1 : 0);
  },
);
