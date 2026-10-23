import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import manifest from '../src/lib/photography/prepared-images.json';
import { preparedPhoto } from '../src/lib/photography/prepared';

describe('prepared hero photographs', () => {
  it('ships real responsive widths and content hashes suitable for immutable caching', async () => {
    for (const [source, variants] of Object.entries(manifest)) {
      const original = await sharp('public' + source).metadata();
      expect(variants.length).toBeGreaterThan(1);
      for (const variant of variants) {
        const data = await readFile('public' + variant.src);
        const actual = await sharp(data).metadata();
        expect(actual.width).toBe(variant.width);
        expect(actual.width).toBeLessThanOrEqual(original.width!);
        expect(variant.src).toContain(createHash('sha256').update(data).digest('hex').slice(0, 12));
      }
    }
  });
  it('keeps the initial desktop hero below 150 KB without using on-demand resizing', async () => {
    const hero = manifest['/images/editorial-strawberry.webp'].find(
      (image) => image.width === 840,
    )!;
    expect((await readFile('public' + hero.src)).length).toBeLessThan(150000);
    expect(preparedPhoto('/images/editorial-strawberry.webp')?.srcSet).toContain('840w');
  });
  it('supports the static review prefix exactly once', () => {
    const photo = preparedPhoto(
      '/Prophotoacademy/images/editorial-strawberry.webp',
      '/Prophotoacademy',
    );
    expect(photo?.src).toMatch(/^\/Prophotoacademy\/images\/hero\//);
    expect(
      photo?.srcSet.split(', ').every((src) => src.startsWith('/Prophotoacademy/images/hero/')),
    ).toBe(true);
    expect(photo?.src).not.toContain('/Prophotoacademy/Prophotoacademy');
  });
  it('leaves new CMS sources to the regular image pipeline', () => {
    expect(preparedPhoto('https://cdn.sanity.io/images/new/editorial-strawberry.webp')).toBeNull();
    expect(preparedPhoto('/images/new-work.webp')).toBeNull();
    expect(preparedPhoto('__proto__')).toBeNull();
  });
});
