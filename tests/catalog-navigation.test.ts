import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { catalogCategory, catalogHref, catalogPrograms } from '../src/lib/catalog/selectors';
import { prioritizePrograms } from '../src/lib/program-priority';

const content = fixture as AcademyContent;

describe('URL-addressable course selection', () => {
  it('selects authored categories without interpreting titles or offering formats', () => {
    const programs = [...content.programs].reverse();
    const selected = catalogPrograms(programs, catalogCategory('course'));
    expect(selected.map((program) => program.id)).toEqual([
      'program-instagram',
      'program-commercial',
      'program-visual',
    ]);
    expect(programs).toEqual([...content.programs].reverse());
    expect(selected.every((program) => program.category === 'course')).toBe(true);
    expect(
      catalogPrograms(
        [{ ...content.programs[3], title: 'Курс фотографії', shortTitle: 'Курс фотографії' }],
        'course',
      ),
    ).toEqual([]);
  });

  it('keeps the CMS order and flagship prioritization inside a selection', () => {
    const programs = prioritizePrograms(content.programs, 'program-instagram');
    expect(catalogPrograms(programs, 'course').map((program) => program.id)).toEqual([
      'program-instagram',
      'program-visual',
      'program-commercial',
    ]);
  });

  it.each([undefined, null, '', 'all', 'offline', 'class', 'COURSE', '<script>'])(
    'shows the complete catalog for unrecognized category %s',
    (value) => {
      expect(catalogCategory(value)).toBe('all');
      expect(catalogPrograms(content.programs, catalogCategory(value))).toBe(content.programs);
    },
  );

  it('allows clearing the category without losing attribution or unrelated query parameters', () => {
    expect(catalogHref('all', 'category=course&utm_campaign=autumn&from_site=hub')).toBe(
      '/courses?utm_campaign=autumn&from_site=hub',
    );
    expect(catalogHref('all', 'category=course')).toBe('/courses');
    expect(catalogHref('all')).toBe('/courses');
  });

  it('replaces duplicate category values and uses stable navigable URLs', () => {
    const href = catalogHref('course', 'category=offline&category=class&utm_source=homepage');
    expect(href).toBe('/courses?category=course&utm_source=homepage');
    const query = new URL(href, 'https://example.com').searchParams;
    expect(query.getAll('category')).toEqual(['course']);
    expect(catalogCategory(query.get('category'))).toBe('course');
  });
});
