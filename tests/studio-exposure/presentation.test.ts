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
    stageHeight: 900,
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

it('keeps the mobile photo stage dark-toned and leaves following directions on readable paper', () => {
  const exposure = studioExposureState({
    top: -1350.4,
    height: 2532,
    stageHeight: 844,
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
      }),
    ),
  );
  expect($('i[class*=hot]')).toHaveLength(6);
  expect($('[aria-hidden=true]').text()).toContain('0.0 EV');
  expect($('section').attr('data-header-tone')).toBe('dark');
  expect($('[data-exposure-stage] img')).toHaveLength(1);
  expect(directions('section').attr('style')).toBeUndefined();
  expect(directions('section').attr('data-header-tone')).toBe('light');
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

it('keeps the original semantic title visible until word geometry is ready', () => {
  const exposure = studioExposureState({
    top: 0,
    height: 1,
    stageHeight: 1,
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
  expect(render()('h2').text()).toBe('неважливо, на що ви знімаєте, важливо, як ви це робите');
  expect(render(true)('[data-title-morphing]').attr('data-title-morphing')).toBe('false');
  expect(render()('[data-title-source-word]')).toHaveLength(5);
  expect(render()('[data-title-copy-word]').closest('[aria-hidden=true]')).toHaveLength(1);
  expect(render()('[data-title-target]').attr('aria-hidden')).toBe('true');
});
