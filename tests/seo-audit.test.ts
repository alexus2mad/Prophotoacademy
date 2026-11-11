import { describe, expect, it } from 'vitest';
import { noindex } from '../scripts/seo-audit/findings.mjs';
import migration from '../scripts/seo-audit/migration-2026-11-12.json';
import {
  inspectDocument,
  inspectSitemap,
  parseRobots,
  robotsAllows,
  safePagePath,
} from '../scripts/seo-audit/inspect.mjs';

const origin = 'https://prophotoacademy.com.ua';
const html = `<!doctype html>
<html lang="uk"><head>
  <title>Зйомка</title>
  <link rel="canonical" href="${origin}/academy">
  <link rel="preload" as="image" imagesrcset="/_next/image?url=%2Fimages%2Fhero.webp&amp;w=640 640w">
  <meta name="robots" content="noindex">
</head><body><main>
  <h1> Академія   фотографії </h1>
  <h2 id="program">Програма</h2>
  <a name="legacy-anchor"></a>
  <a href="#program">До програми</a>
  <a href="https://www.prophotoacademy.com.ua/reviews?ref=secret">Відгуки</a>
  <a href="mailto:private@example.com">Контакт</a>
  <img src="/_next/image?url=%2Fimages%2Fhero.webp&amp;w=640" width="640" height="360" alt="" loading="eager">
  <img src="/images/invalid.png" width="0" loading="lazy" fetchpriority="high">
  <script type="application/ld+json">{"@graph":[{"@type":["Course","CreativeWork"],"name":"Курс"}]}</script>
  <script type="application/ld+json">{bad json}</script>
</main></body></html>`;

describe('public SEO response evidence', () => {
  it('reads head metadata, graph types, image attributes and sanitized HTML links', () => {
    const result = inspectDocument(html, origin + '/academy', new Set([origin]));
    if (!('headings' in result) || !result.headings)
      throw new Error('Missing public audit evidence');
    expect(result.lang).toBe('uk');
    expect(result.titles).toEqual(['Зйомка']);
    expect(result.canonicals).toEqual([origin + '/academy']);
    expect(result.headings).toEqual([
      { level: 1, text: 'Академія фотографії' },
      { level: 2, text: 'Програма' },
    ]);
    expect(result.schema).toEqual({
      scripts: 2,
      invalidScripts: 1,
      nodes: [{ types: ['Course', 'CreativeWork'], propertyNames: ['@type', 'name'] }],
    });
    expect(result.internalLinks).toEqual([
      { path: '/academy#program' },
      { path: '/reviews', alias: 'www' },
    ]);
    expect(result.externalHosts).toEqual([]);
    expect(result.anchors).toEqual(['program', 'legacy-anchor']);
    expect(result.images).toMatchObject({
      total: 2,
      missingAlt: 1,
      emptyAlt: 1,
      missingDimensions: 1,
      lazy: 1,
      eager: 1,
      highPriority: 1,
      preloads: ['/images/hero.webp'],
      firstInMain: { path: '/images/hero.webp', width: 640, height: 360, hasAltText: false },
    });
  });

  it('limits utility evidence to indexability metadata', () => {
    expect(inspectDocument(html, origin, new Set([origin]), true)).toEqual({
      robots: ['noindex'],
      googlebot: [],
      canonicalCount: 1,
    });
  });

  it('keeps crawler-scoped response directives scoped', () => {
    const response = { xRobotsTag: 'Googlebot: noindex, nofollow', html: { robots: ['index'] } };
    expect(noindex(response)).toBe(true);
    expect(noindex(response, 'OAI-SearchBot')).toBe(false);
    expect(noindex({ xRobotsTag: 'none' }, 'OAI-SearchBot')).toBe(true);
  });

  it('handles longest robots rules, exact matches and named agent groups', () => {
    const robots = parseRobots(`
User-agent: *
Disallow: /private*
Allow: /private-preview$
Allow: /equal
Disallow: /equal
User-agent: Googlebot
User-agent: Bingbot
Disallow: /search # annotation
Sitemap: ${origin}/sitemap.xml
`);
    expect(robots.sitemaps).toEqual([origin + '/sitemap.xml']);
    expect(robotsAllows(robots, '/private-preview', 'Audit')).toBe(true);
    expect(robotsAllows(robots, '/private-preview/section', 'Audit')).toBe(false);
    expect(robotsAllows(robots, '/equal', 'Audit')).toBe(true);
    expect(robotsAllows(robots, '/private', 'Googlebot')).toBe(true);
    expect(robotsAllows(robots, '/search?q=x', 'Bingbot')).toBe(false);
  });

  it('accepts an empty sitemap and safe multilingual page paths', () => {
    expect(inspectSitemap('<urlset></urlset>')).toEqual({ kind: 'urlset', locations: [] });
    expect(inspectSitemap('<urlset><url><loc>' + origin + '/</loc></url></urlset>')).toEqual({
      kind: 'urlset',
      locations: [origin + '/'],
    });
    expect(safePagePath('/' + encodeURIComponent('фотографія'))).toBe(true);
    expect(safePagePath('/account%2fsettings')).toBe(false);
    expect(safePagePath('/%61pi')).toBe(false);
  });

  it('preserves the canonical paths observed in Google and excludes the old utility pages', () => {
    const retained = new Set(migration.retained);
    for (const path of migration.evidence.googlePaths) expect(retained.has(path)).toBe(true);
    for (const { path } of migration.excluded) expect(retained.has(path)).toBe(false);
    expect(migration.redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: '/courses', to: '/academy', status: 301 }),
        expect.objectContaining({ from: '/page-in-progress', to: '/academy', status: 301 }),
      ]),
    );
  });
});
