import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, it } from 'vitest';
import { StudioHomeExposure } from '../../src/components/organisms/StudioHomeExposure/StudioHomeExposure';
import { StudioHomeDirections } from '../../src/components/organisms/StudioHomeDirections/StudioHomeDirections';
import { studioExposureState } from '../../src/lib/studio-home/exposure';

it('connects the photo stage and meter to the same desktop exposure', () => {
  const exposure = studioExposureState({
    top: -180,
    height: 1350,
    viewportHeight: 900,
    mobile: false,
    reducedMotion: false,
  });
  const $ = load(
    renderToStaticMarkup(
      createElement(StudioHomeExposure, { section: { current: null }, exposure }),
    ),
  );
  expect($('[data-home-section=exposure]').attr('style')).toContain('--exposure-progress:0.5');
  expect($('img').attr('alt')).toBe('');
  expect($('[aria-hidden=true]').text()).toContain('−1.5 EV');
  expect($('i')).toHaveLength(33);
  expect($('i[class*=on]')).toHaveLength(17);
  expect($('i[class*=hot]')).toHaveLength(0);
  expect($('h2').attr('id')).toBe($('section').attr('aria-labelledby'));
});

it('shares the mobile transition with directions while coloring all 33 bars at completion', () => {
  const exposure = studioExposureState({
    top: -100,
    height: 286,
    viewportHeight: 844,
    mobile: true,
    reducedMotion: false,
  });
  const $ = load(
    renderToStaticMarkup(
      createElement(StudioHomeExposure, { section: { current: null }, exposure }),
    ),
  );
  const directions = load(
    renderToStaticMarkup(
      createElement(StudioHomeDirections, {
        mode: 'academy',
        directions: [],
        transition: exposure.transition,
      }),
    ),
  );
  expect($('i[class*=hot]')).toHaveLength(33);
  expect($('[aria-hidden=true]').text()).toContain('+3.0 EV');
  expect(directions('section').attr('style')).toBe('--exposure-transition:1');
  expect(directions('a').attr('href')).toBe('/academy');
});

it('keeps server-rendered directions readable without an animation override before hydration', () => {
  const $ = load(
    renderToStaticMarkup(createElement(StudioHomeDirections, { mode: 'studio', directions: [] })),
  );
  expect($('section').attr('style')).toBeUndefined();
  expect($('h2').text()).toContain('зал');
  expect($('a').first().attr('href')).toBe('/photo-studio');
});

it('only enables the title fade after an exposure measurement is ready', () => {
  const exposure = studioExposureState({
    top: 0,
    height: 1,
    viewportHeight: 1,
    mobile: false,
    reducedMotion: true,
  });
  const render = (ready?: boolean) =>
    load(
      renderToStaticMarkup(
        createElement(StudioHomeExposure, { section: { current: null }, exposure, ready }),
      ),
    );
  expect(render()('section').attr('data-exposure-ready')).toBe('false');
  expect(render(true)('section').attr('data-exposure-ready')).toBe('true');
  expect(render()('h2').text()).toContain('як ви це робите');
});
