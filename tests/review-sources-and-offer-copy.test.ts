import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it, vi } from 'vitest';
import type { AcademyContent } from '@/lib/content/types';
import fixture from '../content/academy.json';
import { originalReviewSource } from '@/lib/studio-reviews/source';
import { creatorEditorial } from '@/lib/studio-creator/content';
import { StudioProgramReviews } from '@/components/organisms/StudioProgramReviews/StudioProgramReviews';
import Reviews from '@/app/(academy)/reviews/page';
import { getContent } from '@/lib/content';

vi.mock('@/lib/content', () => ({ getContent: vi.fn() }));
vi.mock('@/lib/site-editor/public', () => ({ readSitePage: async () => undefined }));
const content = fixture as AcademyContent;
const original = 'https://www.instagram.com/p/review-example/';
const records = [
  { ...content.testimonials[0], sourceUrl: 'https://www.prophotoacademy.com.ua/reviews' },
  { ...content.testimonials[1], sourceUrl: original },
];
describe('review sources and package descriptions', () => {
  it.each([
    undefined,
    '',
    '/reviews',
    '/reviews/?utm_source=product#stories',
    'https://prophotoacademy.com.ua/reviews',
    'http://www.prophotoacademy.com.ua/reviews/',
    'https://staging.prophotoacademy.com.ua/reviews#example',
    'javascript:alert(1)',
    '//example.org/login',
    'https://user:pass@example.org/review',
  ])('omits an unsuitable index or source URL (%s)', (value) => {
    expect(originalReviewSource(value)).toBeUndefined();
  });
  it.each([
    original,
    '/stories/olena',
    'https://example.org/reviews',
    'https://example.org/reviews?cite=quote',
  ])('retains an actual source (%s)', (value) => {
    expect(originalReviewSource(value)).toBe(value);
  });
  it('shows the internal index fallback on program cards alongside distinct source links', () => {
    const $ = load(renderToStaticMarkup(createElement(StudioProgramReviews, { reviews: records })));
    const links = $('article a');
    expect(links.first().attr('href')).toBe('/reviews');
    expect(links.first().attr('target')).toBeUndefined();
    expect(links.first().text()).toBe('Перейти до всіх відгуків');
    expect(links.last().attr('href')).toBe(original);
    expect(links.last().text()).toBe('Переглянути оригінал');
  });
  it('keeps the real attribution on the reviews index and removes its self-links', async () => {
    vi.mocked(getContent).mockResolvedValue({ ...content, testimonials: records });
    const $ = load(renderToStaticMarkup(await Reviews({})));
    expect($('.review-card')).toHaveLength(2);
    expect($('.review-card a')).toHaveLength(1);
    expect($('.review-card a').attr('href')).toBe(original);
  });
  it('presents the known package-specific instructional conditions', () => {
    const instagram = content.offerings
      .find((offer) => offer.programId === 'program-instagram')!
      .packages.find((pack) => pack.id === 'instagram-base')!;
    expect(instagram.comparison?.support).toEqual({ state: 'excluded' });
    expect(instagram.comparison?.homework).toEqual({ state: 'excluded' });
    expect(instagram.includes).toContain('Доступ до матеріалів 5 місяців');
    const commercial = content.offerings.find((offer) => offer.programId === 'program-commercial')!;
    expect(commercial.packages[0].includes).toContain('Самостійне навчання');
    expect(creatorEditorial.intro.eyebrow).toContain('BASE: самостійно');
    expect(creatorEditorial.benefits[0].text).toContain('формат участі уточнюйте');
    expect(commercial.packages[1].includes.join(' ')).toContain('формат участі уточнюйте');
  });
});
