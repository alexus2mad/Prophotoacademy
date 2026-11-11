import { load } from 'cheerio';

export const auditAgent = 'ProPhotoSeoAudit';
export const auditProduct = auditAgent + '/1.0';
const safePath = /^\/(?:[\p{L}\p{N}][\p{L}\p{N}._-]*(?:\/[\p{L}\p{N}][\p{L}\p{N}._-]*)*\/?)?$/u;
const safeFragment = /^#[a-z0-9][a-z0-9_-]*$/i;
const whitespace = /\s+/g;
const normalizeText = (value) => value.replace(whitespace, ' ').trim();

export function httpUrl(value, base) {
  if (!value) return null;
  try {
    const url = new URL(value, base);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function safePagePath(path) {
  if (/%[0-7][0-9a-f]/i.test(path)) return false;
  try {
    const decoded = decodeURIComponent(path);
    return safePath.test(decoded) && !decoded.includes('..');
  } catch {
    return false;
  }
}

export function parseRobots(text) {
  const groups = [];
  const sitemaps = [];
  let group;
  for (const line of text.split(/\r?\n/)) {
    const [, key, value] = /^\s*([a-z-]+)\s*:\s*(.*?)\s*$/i.exec(line.split('#', 1)[0]) ?? [];
    switch (key?.toLowerCase()) {
      case 'user-agent':
        if (!value) break;
        if (!group || group.rules.length) {
          group = { agents: [], rules: [] };
          groups.push(group);
        }
        group.agents.push(value.toLowerCase());
        break;
      case 'allow':
      case 'disallow':
        if (group) group.rules.push({ pattern: value, allowed: key.toLowerCase() === 'allow' });
        break;
      case 'sitemap':
        if (value) sitemaps.push(value);
        break;
    }
  }
  return { groups, sitemaps };
}

export function robotsAllows(robots, path, agent) {
  const target = agent.toLowerCase();
  const groups = robots.groups.filter(({ agents }) => agents.includes(target));
  const applicable = groups.length
    ? groups
    : robots.groups.filter(({ agents }) => agents.includes('*'));
  const matches = applicable.flatMap(({ rules }) =>
    rules.filter(({ pattern }) => {
      if (!pattern) return false;
      const anchored = pattern.endsWith('$');
      const expression = (anchored ? pattern.slice(0, -1) : pattern)
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp('^' + expression + (anchored ? '$' : '')).test(path);
    }),
  );
  matches.sort(
    (a, b) => b.pattern.length - a.pattern.length || Number(b.allowed) - Number(a.allowed),
  );
  return matches[0]?.allowed ?? true;
}

export function inspectSitemap(text) {
  const $ = load(text, { xml: true });
  return {
    kind:
      $('urlset').length === 1 ? 'urlset' : $('sitemapindex').length === 1 ? 'index' : 'invalid',
    locations: $('urlset > url > loc, sitemapindex > sitemap > loc')
      .map((_, node) => $(node).text().trim())
      .get(),
  };
}

export function directivesFor(values, agent) {
  return values.flatMap((value) => {
    let applies = true;
    return value.split(',').flatMap((raw) => {
      const directive = raw.trim().toLowerCase();
      const [prefix, body] = directive.split(/:\s*/, 2);
      if (
        body &&
        !['max-snippet', 'max-video-preview', 'max-image-preview', 'unavailable_after'].includes(
          prefix,
        )
      ) {
        applies = prefix === agent.toLowerCase();
        return applies ? body.split(/\s+/) : [];
      }
      return applies ? directive.split(/\s+/) : [];
    });
  });
}

function summarizeJsonLd($) {
  const nodes = [];
  let invalidScripts = 0;
  const scripts = $('script[type="application/ld+json"]').toArray();
  for (const script of scripts) {
    try {
      const document = JSON.parse($(script).text());
      const entries = Array.isArray(document) ? document : (document?.['@graph'] ?? [document]);
      if (!Array.isArray(entries)) throw new Error('JSON-LD graph must be an array');
      for (const entry of entries) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          throw new Error('JSON-LD node must be an object');
        }
        const types = [entry['@type']].flat().filter((value) => typeof value === 'string');
        const propertyNames = Object.keys(entry).sort();
        nodes.push({ types, propertyNames });
      }
    } catch {
      invalidScripts++;
    }
  }
  return { scripts: scripts.length, invalidScripts, nodes };
}

function assetPath(value, url) {
  const src = httpUrl(value, url);
  if (!src) return null;
  const pathname = src.pathname === '/_next/image' ? src.searchParams.get('url') : src.pathname;
  const original = httpUrl(pathname, url);
  return original?.pathname ?? null;
}

export function inspectDocument(html, url, origins, metadataOnly = false) {
  const $ = load(html);
  const values = (selector, attribute) =>
    $(selector)
      .map((_, node) => normalizeText(attribute ? ($(node).attr(attribute) ?? '') : $(node).text()))
      .get();
  const metadata = {
    lang: $('html').attr('lang') ?? null,
    titles: values('head title'),
    descriptions: values('head meta[name="description" i]', 'content'),
    canonicals: values('head link[rel~="canonical" i]', 'href'),
    robots: values('head meta[name="robots" i]', 'content'),
    googlebot: values('head meta[name="googlebot" i]', 'content'),
    ogTitle: values('head meta[property="og:title" i]', 'content'),
    ogDescription: values('head meta[property="og:description" i]', 'content'),
    ogImageCount: $('head meta[property="og:image" i]').length,
    ogLocale: values('head meta[property="og:locale" i]', 'content'),
    hreflang: values('head link[rel~="alternate" i][hreflang]', 'hreflang'),
  };
  if (metadataOnly) {
    return {
      robots: metadata.robots,
      googlebot: metadata.googlebot,
      canonicalCount: metadata.canonicals.length,
    };
  }

  const internalLinks = new Map();
  const externalHosts = new Set();
  for (const node of $('a[href]').toArray()) {
    const target = httpUrl($(node).attr('href'), url);
    if (!target) continue;
    const sameSite = origins.has(target.origin);
    const hostAlias = target.hostname === 'www.prophotoacademy.com.ua';
    if (!sameSite && !hostAlias) {
      externalHosts.add(target.hostname);
      continue;
    }
    if (!safePagePath(target.pathname)) continue;
    const hash = safeFragment.test(target.hash) ? target.hash : '';
    const path = target.pathname + hash;
    const alias = hostAlias && !sameSite;
    internalLinks.set(path + (alias ? '@www' : ''), { path, ...(alias ? { alias: 'www' } : {}) });
  }
  const images = $('img').toArray();
  const first = $('main img').first();
  const dimensions = (node) => ['width', 'height'].every((attr) => Number($(node).attr(attr)) > 0);
  const imagePreloads = $('link[rel~="preload" i][as="image" i]')
    .map((_, node) => {
      const source = $(node).attr('href') ?? $(node).attr('imagesrcset')?.split(/\s+/)[0];
      return assetPath(source, url);
    })
    .get();

  return {
    ...metadata,
    headings: $('h1,h2,h3,h4,h5,h6')
      .map((_, node) => ({ level: Number(node.tagName[1]), text: normalizeText($(node).text()) }))
      .get(),
    schema: summarizeJsonLd($),
    internalLinks: [...internalLinks.values()],
    externalHosts: [...externalHosts].sort(),
    anchors: [...new Set([...values('[id]', 'id'), ...values('a[name]', 'name')])].filter((id) =>
      safeFragment.test('#' + id),
    ),
    images: {
      total: images.length,
      missingAlt: images.filter((node) => $(node).attr('alt') === undefined).length,
      emptyAlt: images.filter((node) => $(node).attr('alt') === '').length,
      missingDimensions: images.filter((node) => !dimensions(node)).length,
      lazy: $('img[loading="lazy" i]').length,
      eager: $('img[loading="eager" i]').length,
      highPriority: $('img[fetchpriority="high" i]').length,
      preloads: imagePreloads,
      firstInMain: first.length
        ? {
            path: assetPath(first.attr('src'), url),
            hasAltText: Boolean(first.attr('alt')?.trim()),
            width: Number(first.attr('width')) || null,
            height: Number(first.attr('height')) || null,
            loading: first.attr('loading') ?? null,
            fetchPriority: first.attr('fetchpriority') ?? null,
            responsive: Boolean(first.attr('srcset')),
            sizes: first.attr('sizes') ?? null,
          }
        : null,
    },
  };
}
