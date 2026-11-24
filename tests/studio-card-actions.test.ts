import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { studioHomeDirections } from '../src/lib/studio-home/selectors';
import { newSitePage } from '../src/lib/site-editor/fields';
import { StudioHomeDirectionCard } from '../src/components/molecules/StudioHomeDirectionCard/StudioHomeDirectionCard';
import { StudioAcademyPrograms } from '../src/components/organisms/StudioAcademyPrograms/StudioAcademyPrograms';
import { StudioAcademyProgramRow } from '../src/components/molecules/StudioAcademyProgramRow/StudioAcademyProgramRow';

const content = fixture as AcademyContent;

it('keeps each full-area homepage card to one named native action and preserves its motion target', () => {
  for (const direction of studioHomeDirections(content)) {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioHomeDirectionCard, { direction, fieldPrefix: 'card-1' }),
      ),
    );
    const action = $('article > a, article > button');
    expect(action).toHaveLength(1);
    expect(action.attr('aria-label')).toBe(`${direction.title}: ${direction.action}`);
    expect(action.find('a, button')).toHaveLength(0);
    expect($('[data-card-motion]')).toHaveLength(1);
    expect($('h3').text()).toBe(direction.title);
    expect(action.text()).toContain(direction.action);
    if (direction.href) {
      expect(action.is('a')).toBe(true);
      expect(action.attr('href')).toBe(direction.href);
    } else {
      expect(action.is('button')).toBe(true);
      expect(action.attr('type')).toBe('button');
      expect(action.attr('aria-haspopup')).toBe('dialog');
      expect(action.attr('aria-controls')).toBe('inquiry-dialog');
    }
  }
});

it('gives workshop and camp cards one named action, linking AI Artwork directly to its page', () => {
  const $ = load(renderToStaticMarkup(createElement(StudioAcademyPrograms, content)));
  const cards = $('#workshops article, #camp');
  expect(cards).toHaveLength(6);
  expect($('#workshops article').first().find('a').attr('href')).toBe('/ai-artwork');
  expect($('#workshops a[href="/ai-artwork"]')).toHaveLength(1);
  const names = new Set<string>();
  cards.each((_, card) => {
    const action = $(card).find('a, button');
    expect(action).toHaveLength(1);
    expect(action.find('a, button')).toHaveLength(0);
    expect(action.attr('aria-label')).toContain($(card).find('h2, h3').text());
    if (action.is('a')) {
      expect(action.attr('href')).toBe('/ai-artwork');
      expect(action.text()).toContain('Детальніше');
    } else {
      expect(action.attr('aria-haspopup')).toBe('dialog');
    }
    names.add(action.attr('aria-label')!);
  });
  expect(names.size).toBe(cards.length);
});

it('lists published editor workshops as full-area workshop rows alongside AI Artwork', () => {
  const workshop = newSitePage('/flash-without-fear', 'Flash without fear', 'workshop');
  const cover = workshop.sections[0].fields;
  cover.find((field) => field.id === 'title')!.value = 'Спалахи без страху';
  cover.find((field) => field.id === 'description')!.value = 'Повний опис на сторінці воркшопу';
  const course = newSitePage('/example-course', 'Інший курс', 'course');
  const $ = load(
    renderToStaticMarkup(
      createElement(StudioAcademyPrograms, {
        ...content,
        additionalPages: [workshop, course],
      }),
    ),
  );
  const links = $('#workshops article > a');
  expect(links.map((_, link) => $(link).attr('href')).get()).toEqual([
    '/ai-artwork',
    '/flash-without-fear',
  ]);
  const featured = links.first();
  const added = links.last();
  expect(added.attr('class')).toBe(featured.attr('class'));
  expect(added.parent().attr('class')).toBe(featured.parent().attr('class'));
  expect(added.parent().children('h3').text()).toBe('Спалахи без страху');
  expect(added.attr('aria-label')).toContain('Спалахи без страху');
  expect(added.text()).toBe(featured.text());
  expect($('#workshops').text()).not.toContain('Повний опис');
  expect($('#courses a[href="/example-course"]')).toHaveLength(1);
});

it.each([
  ['individual', '/individual-training'],
  ['corporate', '/corporate-training'],
])('gives the %s card a direct detail link and one separate inquiry action', (id, href) => {
  const $ = load(renderToStaticMarkup(createElement(StudioAcademyPrograms, content)));
  const card = $('article#' + id);
  const detail = card.children('h2').children('a');
  const inquiry = card.children('button');
  expect(card.find('a, button')).toHaveLength(2);
  expect(detail).toHaveLength(1);
  expect(detail.attr('href')).toBe(href);
  expect(detail.text().trim()).toBeTruthy();
  expect(inquiry).toHaveLength(1);
  expect(inquiry.attr('type')).toBe('button');
  expect(inquiry.attr('aria-label')).toContain(detail.text());
  expect(inquiry.attr('aria-haspopup')).toBe('dialog');
  expect(inquiry.attr('aria-controls')).toBe('inquiry-dialog');
  expect(card.find('a a, a button, button a, button button')).toHaveLength(0);
});

it('preserves one link around the entire existing course row', () => {
  const program = content.programs[0];
  const $ = load(renderToStaticMarkup(createElement(StudioAcademyProgramRow, { program })));
  expect($('a')).toHaveLength(1);
  expect($('a').attr('href')).toBe(`/${program.slug}`);
  expect($('a h3').text()).toBe(program.title);
  expect($('button, a a')).toHaveLength(0);
});
