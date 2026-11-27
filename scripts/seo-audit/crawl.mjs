/** Anonymous, bounded GET/HEAD audit for the Academy and its loopback builds. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { buildFindings } from './findings.mjs';
import {
  auditAgent,
  auditProduct,
  httpUrl,
  inspectDocument,
  inspectSitemap,
  parseRobots,
  robotsAllows,
  safePagePath,
} from './inspect.mjs';

const publicOrigins = {
  production: 'https://prophotoacademy.com.ua',
  staging: 'https://staging.prophotoacademy.com.ua',
};
const academyHosts = new Set([
  'prophotoacademy.com.ua',
  'www.prophotoacademy.com.ua',
  'staging.prophotoacademy.com.ua',
]);
const pageLimit = 80;
const seeds = [
  '/',
  '/academy',
  '/about-us',
  '/ai-artwork',
  '/contacts',
  '/reviews',
  '/student-work',
  '/photo-studio',
  '/shop',
];
const excluded =
  /^\/(?:_next|admin|api|account|checkout|courses|demo|hub|images|learn|learning|login|logout|operations|page-in-progress|401|review|saved|social|social-previews|studio|thanks)(?:\/|$)/i;
const privatePrefix =
  /^\/(?:_next|admin|api|account|checkout|demo|learn|learning|login|logout|operations|saved|social-previews|studio|thanks)(?:\/|$)/i;
const oldLanding = '/page-in-progress';
const catalog = '/courses';
const courseQuery = '?category=course&utm_source=seo-audit';
const gallery = '/social-previews/';
const missingPage = '/seo-audit-page-does-not-exist';
const botAgents = { Googlebot: 'Googlebot', 'OAI-SearchBot': 'OAI-SearchBot/1.0' };

const { values } = parseArgs({
  options: {
    environment: { type: 'string', default: 'production' },
    origin: { type: 'string' },
    'canonical-origin': { type: 'string' },
    redirects: { type: 'string' },
    migration: { type: 'string' },
    output: { type: 'string' },
    strict: { type: 'boolean' },
    help: { type: 'boolean' },
  },
});
if (values.help) {
  console.log(`Usage: node scripts/seo-audit/crawl.mjs [--environment production|staging]
  [--origin http://127.0.0.1:PORT] [--canonical-origin ORIGIN]
  [--migration PATH] [--redirects PATH] [--output PATH] [--strict]

The default is the live Studio variant. Use --origin for a loopback build and
--canonical-origin if that build emits a different canonical origin.
--redirects accepts a JSON array of public legacy mappings, for example
[{ "from": "/old-path", "to": "/relevant-path", "status": 301 }].
--migration also checks retained canonical paths and excluded utility paths.
See scripts/seo-audit/migration-2026-11-12.json for the reviewed inventory.
--strict returns exit code 1 for failed assertions. Advisory findings remain in JSON.
The crawler checks robots.txt before reading HTML. Fixed utility and migration
checks use anonymous HEAD when no response body is needed. Redirects are manual.`);
  process.exit(0);
}

const environment = values.environment;
if (!Object.hasOwn(publicOrigins, environment)) throw new Error('Unknown Academy environment');

function verifyOrigin(value, defaultOrigin) {
  const url = httpUrl(value ?? defaultOrigin);
  if (
    !url ||
    (url.origin !== defaultOrigin && !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('Expected the selected Academy origin or a loopback origin');
  }
  return url.origin;
}

const canonicalOrigin = verifyOrigin(values['canonical-origin'], publicOrigins[environment]);
const origin = verifyOrigin(values.origin, publicOrigins[environment]);
const live = origin === publicOrigins[environment];
const production = environment === 'production';
const origins = new Set([origin, canonicalOrigin]);
const liveAliases = [
  ['http://prophotoacademy.com.ua/academy' + courseQuery, '/academy' + courseQuery, [301]],
  ['http://www.prophotoacademy.com.ua/academy' + courseQuery, '/academy' + courseQuery, [301]],
  ['https://www.prophotoacademy.com.ua/academy' + courseQuery, '/academy' + courseQuery, [301]],
];

async function batch(items, action) {
  const out = [];
  for (let start = 0; start < items.length; start += 4) {
    out.push(...(await Promise.all(items.slice(start, start + 4).map(action))));
  }
  return out;
}

async function request(path, { mode = 'head', agent = auditProduct } = {}) {
  const url = httpUrl(path, origin);
  if (!url || (url.origin !== origin && !(live && academyHosts.has(url.hostname)))) {
    throw new Error('Request outside the selected Academy origin');
  }
  try {
    const response = await fetch(url, {
      method: mode === 'head' ? 'HEAD' : 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
      headers: { 'user-agent': agent },
    });
    const result = {
      status: response.status,
      location: response.headers.get('location'),
      xRobotsTag: response.headers.get('x-robots-tag'),
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    };
    const html = result.contentType?.startsWith('text/html');
    if (
      mode === 'head' ||
      (mode === 'page' && (!response.ok || !html)) ||
      (mode === 'metadata' && (!html || response.status >= 500))
    ) {
      await response.body?.cancel();
      return result;
    }
    const body = await response.text();
    if (mode === 'text') return { ...result, body };
    return {
      ...result,
      decodedHtmlBytes: Buffer.byteLength(body),
      html: inspectDocument(body, url, origins, mode === 'metadata'),
    };
  } catch (error) {
    return { error: error.cause?.code ?? error.name };
  }
}

function marketingPath(path) {
  return safePagePath(path) && !excluded.test(path) && !/\.[a-z0-9]+$/i.test(path);
}

async function readJson(file) {
  return JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
}
const migration = values.migration ? await readJson(values.migration) : null;
if (
  migration &&
  (!Array.isArray(migration.retained) ||
    migration.retained.some((path) => typeof path !== 'string' || !marketingPath(path)) ||
    !Array.isArray(migration.excluded) ||
    migration.excluded.some(
      ({ path, status, noindex }) =>
        typeof path !== 'string' ||
        !safePagePath(path) ||
        ![200, 404, 410].includes(status) ||
        (status === 200 && !(path === '/thanks' && noindex === true)),
    ))
)
  throw new Error('Invalid retained or excluded paths in migration manifest');

const [robotsResponse, sitemapResponse] = await Promise.all([
  request('/robots.txt', { mode: 'text' }),
  request('/sitemap.xml', { mode: 'text' }),
]);
const { body: robotsText, ...robots } = robotsResponse;
const { body: sitemapText, ...sitemap } = sitemapResponse;
robots.document =
  robots.status === 200 && robots.contentType?.startsWith('text/plain')
    ? parseRobots(robotsText)
    : null;
sitemap.document = sitemap.status === 200 ? inspectSitemap(sitemapText) : null;
sitemap.rejectedLocations = [];

function allowed(path, agent = auditAgent) {
  return Boolean(robots.document && robotsAllows(robots.document, path, agent));
}

const submitted = new Set();
for (const entry of sitemap.document?.locations ?? []) {
  const url = httpUrl(entry);
  if (
    !url ||
    url.origin !== canonicalOrigin ||
    url.search ||
    url.hash ||
    !marketingPath(url.pathname)
  ) {
    sitemap.rejectedLocations.push(url ? url.origin + url.pathname : '[invalid absolute URL]');
  } else {
    submitted.add(url.pathname);
  }
}
const seedPaths = new Set([...seeds, ...(migration?.retained ?? [])]);
const paths = new Set([...seedPaths, ...submitted]);
const pages = [];
const maxWaves = 3;
let pending = [...paths];
for (let wave = 0; wave < maxWaves && pending.length && pages.length < pageLimit; wave++) {
  const found = await batch(pending.slice(0, pageLimit - pages.length), async (path) => ({
    path,
    submitted: submitted.has(path),
    seed: seedPaths.has(path),
    googlebotAllowed: allowed(path, 'Googlebot'),
    ...(allowed(path) ? await request(path, { mode: 'page' }) : { skipped: 'robots.txt' }),
  }));
  pages.push(...found);
  pending = [];
  for (const page of found) {
    for (const link of page.html?.internalLinks ?? []) {
      const [path] = link.path.split('#');
      if (!link.alias && marketingPath(path) && !paths.has(path)) {
        paths.add(path);
        pending.push(path);
      }
    }
  }
}

const utility = [
  { path: '/account', expectedStatus: 307, expectedLocationPrefix: '/login?' },
  { path: '/account/settings', expectedStatus: 307, expectedLocationPrefix: '/login?' },
  { path: '/admin', expectedStatus: 307, expectedLocationPrefix: '/admin/courses' },
  { path: '/admin/courses', expectedStatus: 307, expectedLocationPrefix: '/login?' },
  { path: '/login', expectedStatus: 200, noindexExpected: true, metadata: true },
  { path: '/demo/account', noindexExpected: true, metadata: true },
  { path: '/demo/admin', noindexExpected: true, metadata: true },
  { path: '/studio' },
  { path: '/operations' },
  { path: '/checkout' },
  { path: '/thanks' },
  { path: '/learn' },
  { path: '/saved' },
  { path: '/review' },
  { path: missingPage, expectedStatus: 404, metadata: true },
];
if (!production && live) {
  for (const path of ['/', '/academy', '/robots.txt', '/sitemap.xml']) utility.push({ path });
  utility.push({ path: gallery, expectedStatus: 200 });
}
const utilityByPath = new Map(utility.map((item) => [item.path, item]));
for (const { path, status, noindex } of migration?.excluded ?? []) {
  utilityByPath.set(path, {
    path,
    expectedStatus: status,
    noindexExpected: noindex,
    metadata: Boolean(noindex),
  });
}
const probes = await batch(
  [...utilityByPath.values()],
  async ({ path, metadata, ...expectations }) => {
    const metadataBlocked = Boolean(metadata && !allowed(path));
    return {
      path,
      ...expectations,
      metadataBlocked,
      enforceStagingHeader: !production && live,
      ...(await request(path, { mode: metadata && !metadataBlocked ? 'metadata' : 'head' })),
    };
  },
);

const builtInRedirects = [
  [catalog, '/academy', [301]],
  [catalog + courseQuery, '/academy' + courseQuery + '#courses', [301]],
  [oldLanding, '/academy', [301]],
  ['/401', '/', [301, 308]],
  ['/academy/', '/academy', [308]],
];
if (production && live) builtInRedirects.push(...liveAliases);
if (live) {
  const hub = 'https://www.prophotohub.com.ua';
  builtInRedirects.push(
    ['/hub', hub + '/', [308]],
    ['/hub/robots.txt', hub + '/robots.txt', [308]],
    ['/hub/sitemap.xml', hub + '/sitemap.xml', [308]],
  );
}

const redirectChecks = new Map();
for (const [from, to, statuses] of builtInRedirects) {
  redirectChecks.set(httpUrl(from, origin).href, { from, to, statuses });
}
const manifests = [];
if (migration) manifests.push(migration.redirects);
if (values.redirects) manifests.push(await readJson(values.redirects));
for (const manifest of manifests) {
  if (!Array.isArray(manifest) || manifest.length > 200) {
    throw new Error('Expected a redirect manifest with at most 200 mappings');
  }
  for (const entry of manifest) {
    const { from, to, status = 301 } = entry ?? {};
    const start = typeof from === 'string' && httpUrl(from, origin);
    const end = typeof to === 'string' && httpUrl(to, canonicalOrigin);
    if (
      !start ||
      !end ||
      start.hash ||
      (start.origin !== origin && !(live && academyHosts.has(start.hostname))) ||
      !safePagePath(start.pathname) ||
      privatePrefix.test(start.pathname) ||
      !marketingPath(end.pathname) ||
      ![301, 308].includes(status) ||
      ![canonicalOrigin, origin].includes(end.origin)
    ) {
      throw new Error('Invalid public source or Academy destination in redirect manifest');
    }
    if (
      start.pathname === end.pathname &&
      start.origin === end.origin &&
      start.search === end.search
    ) {
      throw new Error('Redirect manifest contains a self-redirect');
    }
    redirectChecks.set(start.href, { from, to, statuses: [status] });
  }
}
function redirectTarget({ status, html, xRobotsTag }) {
  return {
    status,
    xRobotsTag,
    html: html ? { robots: html.robots, googlebot: html.googlebot } : null,
  };
}
const targetPages = new Map(pages.map((page) => [page.path, redirectTarget(page)]));

const redirects = await batch([...redirectChecks.values()], async ({ from, to, statuses }) => {
  const result = await request(from);
  const source = httpUrl(from, origin);
  const expected = httpUrl(to, origin);
  const actual = httpUrl(result.location, source);
  let target;
  if (production && origins.has(expected.origin) && marketingPath(expected.pathname)) {
    const path = expected.pathname;
    let response = targetPages.get(path);
    if (!response && allowed(path)) {
      response = redirectTarget(await request(path, { mode: 'page' }));
      targetPages.set(path, response);
    }
    target = response ?? { skipped: 'robots.txt' };
  }
  return {
    from,
    to,
    ...result,
    expectedStatuses: statuses,
    passed: statuses.includes(result.status) && actual?.href === expected.href,
    ...(target ? { target } : {}),
  };
});

const botPaths = ['/', '/academy', '/food-product-photography'];
const botSamples = production
  ? await batch(
      Object.entries(botAgents).flatMap(([agent, userAgent]) =>
        botPaths.map((path) => ({ agent, userAgent, path })),
      ),
      async ({ agent, userAgent, path }) => ({
        agent,
        path,
        ...(allowed(path, agent)
          ? await request(path, { mode: 'page', agent: userAgent })
          : { skipped: 'robots.txt' }),
      }),
    )
  : [];

const report = {
  collectedAt: new Date().toISOString(),
  environment,
  origin,
  canonicalOrigin,
  robots,
  sitemap,
  migration: migration
    ? { date: migration.date, retained: migration.retained, excluded: migration.excluded }
    : null,
  pages,
  probes,
  redirects,
  botSamples,
  unvisitedPaths: [...paths].filter((path) => !pages.some((page) => page.path === path)),
};
const findings = buildFindings(report);
const errors = findings.filter(({ severity }) => severity === 'error').length;
const warnings = findings.length - errors;
const evidence = JSON.stringify({ ...report, findings }, null, 2) + '\n';
if (values.output) {
  await mkdir(dirname(values.output), { recursive: true });
  await writeFile(values.output, evidence);
  console.log(
    `Audited ${environment} at ${origin}. ${pages.length} page paths, ${errors} errors, ${warnings} warnings.`,
  );
  console.log(values.output);
} else {
  process.stdout.write(evidence);
}
if (values.strict && errors) process.exitCode = 1;
