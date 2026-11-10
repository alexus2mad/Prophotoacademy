import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { studioHomeDirections, studioHomeRooms } from '../src/lib/studio-home/selectors';
import { StudioHomeDirectionCard } from '../src/components/molecules/StudioHomeDirectionCard/StudioHomeDirectionCard';
import { StudioAcademyPrograms } from '../src/components/organisms/StudioAcademyPrograms/StudioAcademyPrograms';
import { StudioAcademyProgramRow } from '../src/components/molecules/StudioAcademyProgramRow/StudioAcademyProgramRow';

const content = fixture as AcademyContent;

it('keeps each full-area homepage card to one named native action and preserves its motion target', () => {
  for (const direction of [...studioHomeDirections(content), ...studioHomeRooms]) {
    const $ = load(renderToStaticMarkup(createElement(StudioHomeDirectionCard, { direction })));
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

it('gives every workshop and format card one distinguishable inquiry action without nested controls', () => {
  const $ = load(renderToStaticMarkup(createElement(StudioAcademyPrograms, content)));
  const cards = $('#workshops article, #individual, #corporate, #camp');
  expect(cards).toHaveLength(7);
  const names = new Set<string>();
  cards.each((_, card) => {
    const action = $(card).find('button');
    expect(action).toHaveLength(1);
    expect(action.find('a, button')).toHaveLength(0);
    expect(action.attr('aria-label')).toContain($(card).find('h2, h3').text());
    expect(action.attr('aria-haspopup')).toBe('dialog');
    names.add(action.attr('aria-label')!);
  });
  expect(names.size).toBe(cards.length);
});

it('preserves one link around the entire existing course row', () => {
  const program = content.programs[0];
  const $ = load(renderToStaticMarkup(createElement(StudioAcademyProgramRow, { program })));
  expect($('a')).toHaveLength(1);
  expect($('a').attr('href')).toBe(`/${program.slug}`);
  expect($('a h3').text()).toBe(program.title);
  expect($('button, a a')).toHaveLength(0);
});
