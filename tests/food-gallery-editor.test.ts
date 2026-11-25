import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { StudioCreatorTemplate } from '../src/components/templates/StudioCreatorTemplate/StudioCreatorTemplate';
import { brandReviewContent } from '../src/lib/site-editor/brand/reviews';
import { pagePlacements } from '../src/lib/site-editor/placements';
import { programPresentationContent } from '../src/lib/site-editor/program';
import type { SitePage } from '../src/lib/site-editor/types';

it('retains editable Food work and review fields and presents the sources accurately', () => {
  const content = fixture as AcademyContent;
  const program = content.programs.find((p) => p.id === 'program-food')!;
  const page: SitePage = {
    path: '/' + program.slug,
    kind: 'course',
    title: program.title,
    sections: structuredClone(programPresentationContent(content, program).sections),
  };
  const locations = pagePlacements(page).map((p) => p.id);
  expect(locations.slice(locations.indexOf('benefits'), locations.indexOf('steps') + 1)).toEqual([
    'benefits',
    'gallery',
    'curriculum',
    'steps',
  ]);
  const field = (section: string, key: string) =>
    page.sections.find((s) => s.id === section)!.fields.find((f) => f.id === key)!;
  field('gallery-heading', 'description').value = 'Приклади роботи зі світлом';
  field('reviews-heading', 'intro').value = 'Враження учасників';
  const first = content.works.find((w) => w.id === program.workIds[0])!;
  field('gallery', first.imageId + '-alt').value = 'Деталь плитки шоколаду';
  const shown = programPresentationContent(content, program, page);
  const $ = load(
    renderToStaticMarkup(
      createElement(StudioCreatorTemplate, {
        page,
        program: shown.program,
        content: shown.content,
        editorial: shown.editorial!,
      }),
    ),
  );
  expect($('#student-works [data-site-field="description"]').text()).toBe(
    'Приклади роботи зі світлом',
  );
  expect($('#creator-work-rail img').first().attr('alt')).toBe('Деталь плитки шоколаду');
  const galleryAction = $('#student-works a[href="#packages"]');
  expect(galleryAction.text()).toContain('Хочу на курс');
  expect($('#creator-work-rail').next().next().find('a').is(galleryAction)).toBe(true);
  expect($('#packages')).toHaveLength(1);
  const reviews = $('#program-reviews');
  expect(reviews.find('h2').text()).toContain('Що кажуть *випускники');
  expect(reviews.find('[data-site-field="intro"]').text()).toBe('Враження учасників');
  expect(reviews.find('[data-site-field="outro"]').text()).toBe(
    'Ми навчаємо бачити та вміти працювати з композицією, кольором, світлом та налаштуванням камери',
  );
  expect(reviews.find('[data-site-field="note"]').text()).toBe(
    'Ви можете знімати на камеру, на телефон, на плівку',
  );
  const sources = reviews.find('article a');
  expect(sources).toHaveLength(11);
  sources.each((_, anchor) => {
    expect($(anchor).text()).toBe('Усі відгуки');
    expect($(anchor).attr('href')).toBe('/reviews');
  });
  expect(brandReviewContent('creator').frame).toBeUndefined();
  expect(brandReviewContent('academy').frame).toBeUndefined();
});
