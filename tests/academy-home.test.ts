import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { academyDirections } from '../src/lib/academy-home/selectors';
import { AcademyDirectionCard } from '../src/components/molecules/AcademyDirectionCard/AcademyDirectionCard';
import homeImages from '../src/lib/photography/home-images.json';
import manifest from '../src/lib/photography/prepared-home-images.json';
import { preparedPhoto } from '../src/lib/photography/prepared';

const content = fixture as AcademyContent;
describe('Academy homepage destinations and photography', () => {
  it('opens real program routes, a metadata-filtered course catalog or all programs', () => {
    for (const direction of academyDirections(content)) {
      if (!direction.href) continue;
      const url = new URL(direction.href, 'https://academy.example');
      if (url.pathname === '/courses') {
        expect(['', '?category=course']).toContain(url.search);
        expect(content.programs.length).toBeGreaterThan(0);
        if (url.search)
          expect(content.programs.some((program) => program.category === 'course')).toBe(true);
      } else {
        expect(content.programs.some((p) => '/' + p.slug === url.pathname)).toBe(true);
      }
    }
  });
  it('makes the six directions distinct and keeps workshop and camp requests explicit', () => {
    const directions = academyDirections(content);
    expect(directions).toHaveLength(6);
    expect(directions.find((direction) => direction.title === 'Курси')?.href).toBe(
      '/courses?category=course',
    );
    expect(directions.find((direction) => direction.title === 'Усі програми')?.href).toBe(
      '/courses',
    );
    expect(directions.find((direction) => direction.title === 'Воркшопи')).toMatchObject({
      subtitle: 'Дізнатися про наступні воркшопи',
      inquirySubject: 'workshops',
    });
    expect(directions.find((direction) => direction.title === 'Воркшопи')?.href).toBeUndefined();
    expect(directions.some((direction) => direction.subtitle === 'Офлайн програми')).toBe(false);
    expect(
      directions.find((direction) => direction.title === 'ProPhoto кемп')?.inquirySubject,
    ).toBe('camp');
  });
  it('uses one semantic action per card without nesting interactive controls', () => {
    for (const direction of academyDirections(content)) {
      const $ = load(renderToStaticMarkup(createElement(AcademyDirectionCard, { direction })));
      expect($('article[data-card-motion]').length).toBe(1);
      expect($('a, button').length).toBe(1);
      expect($('a a, a button, button a, button button').length).toBe(0);
      if (direction.href) expect($('a').attr('href')).toBe(direction.href);
      else {
        expect($('button').attr('type')).toBe('button');
        expect($('button').attr('aria-label')).toBe(direction.inquiryTitle);
        expect($('button').attr('aria-haspopup')).toBe('dialog');
      }
    }
  });
  it('keeps custom training contextual if its program record is temporarily absent', () => {
    const directions = academyDirections({
      ...content,
      programs: content.programs.filter(
        (program) => !['individual', 'corporate'].includes(program.category),
      ),
    });
    for (const subject of ['individual-training', 'corporate-training']) {
      const direction = directions.find((item) => item.inquirySubject === subject);
      expect(direction?.href).toBeUndefined();
      expect(direction?.inquiryTitle).toBeTruthy();
      expect(direction?.inquiryTitle?.toLocaleLowerCase('uk')).toContain(
        direction?.title.toLocaleLowerCase('uk'),
      );
    }
  });
  it('keeps the unannounced camp an inquiry, without a fabricated purchase', () => {
    const camp = academyDirections(content).find((d) => d.title === 'ProPhoto кемп');
    expect(camp?.inquiryTitle).toContain('наступний ProPhoto кемп');
    expect(camp?.href).toBeUndefined();
  });
  it('ships sharp responsive originals with immutable hashes and reserved aspect ratios', async () => {
    for (const photo of Object.values(homeImages)) {
      const variants = manifest[photo.src as keyof typeof manifest];
      expect(variants.length).toBeGreaterThan(1);
      for (const variant of variants) {
        const bytes = await readFile('public' + variant.src);
        const actual = await sharp(bytes).metadata();
        expect(actual.width).toBe(variant.width);
        expect(actual.width).toBeLessThanOrEqual(photo.width);
        expect(
          Math.abs(actual.height! - (variant.width * photo.height) / photo.width),
        ).toBeLessThanOrEqual(1);
        expect(variant.src).toContain(
          createHash('sha256').update(bytes).digest('hex').slice(0, 12),
        );
      }
      expect(preparedPhoto(photo.src, '/Prophotoacademy')?.src).toBe(
        '/Prophotoacademy' + photo.src,
      );
    }
    expect((await readFile('public' + homeImages.hero.src)).length).toBeLessThan(150_000);
  });
});
