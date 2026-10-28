import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { academyDirections } from '../src/lib/academy-home/selectors';
import homeImages from '../src/lib/photography/home-images.json';
import manifest from '../src/lib/photography/prepared-home-images.json';
import { preparedPhoto } from '../src/lib/photography/prepared';

const content = fixture as AcademyContent;
describe('Academy homepage destinations and photography', () => {
  it('opens real program routes or the complete catalog', () => {
    for (const direction of academyDirections(content)) {
      if (!direction.href) continue;
      const url = new URL(direction.href, 'https://academy.example');
      if (url.pathname === '/courses') {
        expect(url.search).toBe('');
        expect(content.programs.length).toBeGreaterThan(0);
      } else {
        expect(content.programs.some((p) => '/' + p.slug === url.pathname)).toBe(true);
      }
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
