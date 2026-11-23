import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, it } from 'vitest';
import { StudioCreatorStory } from '@/components/organisms/StudioCreatorStory/StudioCreatorStory';
import { programPresentationContent } from '@/lib/site-editor/program';
import type { AcademyContent } from '@/lib/content/types';
import type { SitePage } from '@/lib/site-editor/types';
import fixture from '../content/academy.json';

const content = fixture as AcademyContent;

function story(id: string, page?: SitePage) {
  const program = content.programs.find((entry) => entry.id === id)!;
  const { editorial, sections } = programPresentationContent(content, program, page);
  const html = renderToStaticMarkup(
    createElement(StudioCreatorStory, {
      program,
      editorial: editorial!,
      duration: '12 тижнів',
      page,
    }),
  );
  return { $: load(html), fields: sections.find((section) => section.id === 'benefits')!.fields };
}

it('renders ten readable Food cards with all twenty managed fields, including the optional description', () => {
  const { $, fields } = story('program-food');
  const cards = $('#food-benefits > li');
  expect(cards).toHaveLength(10);
  fields.forEach((field) => {
    const target = cards.find(`[data-site-field="${field.id}"]`);
    expect(target).toHaveLength(1);
    expect(target.text()).toBe(field.value);
  });
  expect(fields).toHaveLength(20);
  expect(cards.eq(2).find('[data-site-field="text-2"]').text()).toBe('');
  expect(cards.eq(4).find('p').text()).toContain('Строк доступу залежить від пакета');
  expect(cards.eq(6).find('p').text()).toContain('\n\n');
});

it('renders edited copy in its existing card and leaves the other course on its connector layout', () => {
  const page: SitePage = {
    path: '/food-product-photography',
    title: 'Food',
    kind: 'course',
    sections: [
      {
        id: 'benefits',
        label: 'Переваги',
        fields: [
          { id: 'text-2', label: 'Текст 3', kind: 'multiline', value: 'Доданий редактором текст' },
        ],
      },
    ],
  };
  const { $ } = story('program-food', page);
  expect($('#food-benefits > li').eq(2).find('p').text()).toBe('Доданий редактором текст');
  const creator = story('program-commercial').$;
  expect(creator('#food-benefits')).toHaveLength(0);
  expect(creator('[data-site-section="benefits"] ul > li img').length).toBeGreaterThan(0);
});
