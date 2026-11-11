import { directivesFor, httpUrl } from './inspect.mjs';

const legal = new Set(['/privacy-policy', '/terms-of-service']);
const previews = new Set(['/photo-studio', '/shop']);
const legalOrRetired = new Set([...legal, '/pro-photo-lab']);

export function noindex(response, agent = 'googlebot') {
  const { robots = [], googlebot = [] } = response.html ?? {};
  const directives = directivesFor([response.xRobotsTag ?? '', ...robots], agent);
  if (agent.toLowerCase() === 'googlebot') directives.push(...directivesFor(googlebot, agent));
  return directives.includes('noindex') || directives.includes('none');
}

function one(values) {
  return values.length === 1 && Boolean(values[0]);
}

export function buildFindings(report) {
  const { environment, pages, probes, botSamples, redirects, robots, sitemap, canonicalOrigin } =
    report;
  const production = environment === 'production';
  const issues = [];
  const add = (severity, url, problem) => issues.push({ severity, url, problem });
  const byPath = new Map(pages.map((page) => [page.path, page]));
  const byMetadata = { titles: new Map(), descriptions: new Map() };

  if (robots.status !== 200 || !robots.document) {
    add('error', '/robots.txt', 'robots.txt could not be verified');
  }
  if (sitemap.status !== 200 || sitemap.document?.kind !== 'urlset') {
    add('error', '/sitemap.xml', 'Expected a successful sitemap urlset');
  }
  const sitemapUrl = new URL('/sitemap.xml', canonicalOrigin).href;
  if (production && !robots.document?.sitemaps.includes(sitemapUrl)) {
    add('error', '/robots.txt', 'Production robots.txt does not advertise the canonical sitemap');
  }
  if (!production && robots.document?.sitemaps.length) {
    add('error', '/robots.txt', 'Staging advertises a sitemap');
  }
  const locations = sitemap.document?.locations ?? [];
  if (production && !locations.length) add('error', '/sitemap.xml', 'Production sitemap is empty');
  if (!production && locations.length) {
    add('error', '/sitemap.xml', 'Staging sitemap contains URLs');
  }
  if (new Set(locations).size !== locations.length) {
    add('error', '/sitemap.xml', 'Sitemap contains duplicate URL entries');
  }
  for (const path of sitemap.rejectedLocations) {
    add('error', path, 'Sitemap entry is outside the canonical public Academy scope');
  }
  for (const path of report.unvisitedPaths) {
    add('warning', path, 'Page was beyond the crawl limit');
  }

  for (const page of pages) {
    const { html, path, submitted } = page;
    const shouldIndex = production && !previews.has(path);
    if (!html) {
      if (page.skipped && !production) continue;
      add(
        submitted || previews.has(path) || page.seed ? 'error' : 'warning',
        path,
        page.skipped ? 'Content crawl disallowed by robots.txt' : 'Expected HTTP 200 HTML',
      );
      continue;
    }
    if (shouldIndex && noindex(page)) add('error', path, 'Public page has noindex');
    if (!shouldIndex && !noindex(page)) add('error', path, 'Expected noindex directive');
    if (shouldIndex && !page.googlebotAllowed) add('error', path, 'Page blocked for Googlebot');
    if (previews.has(path) && submitted) add('error', path, 'Preview URL is in the sitemap');
    if (!shouldIndex) continue;
    if (!submitted) add('warning', path, 'Discovered public page is absent from the sitemap');
    if (html.lang?.toLowerCase() !== 'uk') add('error', path, 'Expected document lang="uk"');
    if (!one(html.titles)) add('error', path, 'Expected one nonempty title in the head');
    if (!one(html.descriptions)) add('warning', path, 'Expected one nonempty meta description');
    const canonical = httpUrl(html.canonicals[0]);
    if (!one(html.canonicals) || canonical?.href !== new URL(path, canonicalOrigin).href) {
      add('error', path, 'Expected one absolute self-canonical in the head');
    }
    if (html.headings.filter(({ level }) => level === 1).length !== 1) {
      add('warning', path, 'Expected one H1');
    }
    if (html.schema.invalidScripts) add('error', path, 'Invalid JSON-LD script');
    if (!legalOrRetired.has(path) && !html.schema.nodes.some(({ types }) => types.length)) {
      add('warning', path, 'No typed JSON-LD nodes');
    }
    if (html.images.missingAlt) add('warning', path, 'Image elements lack alt attributes');
    if (html.images.missingDimensions) {
      add('warning', path, 'Image elements lack positive width and height attributes');
    }
    for (const [field, seen] of Object.entries(byMetadata)) {
      if (!one(html[field])) continue;
      const text = html[field][0].toLocaleLowerCase('uk');
      const first = seen.get(text);
      if (first) add('warning', path, 'Duplicate ' + field + ' with ' + first);
      seen.set(text, first ?? path);
    }

    for (const link of html.internalLinks) {
      if (link.alias) continue;
      const [targetPath, id] = link.path.split('#');
      const target = byPath.get(targetPath);
      if (target?.status >= 400) add('warning', path, 'Broken internal link to ' + link.path);
      if (id && target?.html && !target.html.anchors.includes(id)) {
        add('warning', path, 'Fragment absent from response HTML at ' + link.path);
      }
    }
  }

  for (const page of pages) {
    if (
      production &&
      page.submitted &&
      page.path !== '/' &&
      !pages.some(
        ({ path, html }) =>
          path !== page.path &&
          html?.internalLinks.some((link) => link.path.split('#')[0] === page.path),
      )
    ) {
      add('warning', page.path, 'No incoming HTML link from another crawled page');
    }
  }

  for (const probe of probes) {
    if (probe.error) add('error', probe.path, 'Utility probe failed');
    if (probe.expectedStatus && probe.status !== probe.expectedStatus) {
      add('error', probe.path, 'Expected status ' + probe.expectedStatus);
    }
    if (probe.noindexExpected && probe.status === 200 && !noindex(probe)) {
      add(
        'error',
        probe.path,
        probe.metadataBlocked
          ? 'Utility page has no X-Robots-Tag noindex and robots.txt blocks HTML metadata'
          : 'Utility page is missing noindex',
      );
    }
    if (probe.expectedLocationPrefix && !probe.location?.startsWith(probe.expectedLocationPrefix)) {
      add('error', probe.path, 'Unexpected anonymous redirect');
    }
    if (!production && probe.enforceStagingHeader && !noindex({ xRobotsTag: probe.xRobotsTag })) {
      add('error', probe.path, 'Staging response is missing X-Robots-Tag noindex');
    }
  }

  for (const probe of botSamples) {
    if (probe.skipped) continue;
    if (probe.status !== 200 || !probe.html) {
      add('error', probe.path, probe.agent + ' did not receive HTTP 200 HTML');
      continue;
    }
    if (!one(probe.html.titles) || !one(probe.html.canonicals)) {
      add('error', probe.path, probe.agent + ' did not receive title and canonical in the head');
    }
    if (noindex(probe, probe.agent)) add('error', probe.path, probe.agent + ' received noindex');
  }

  for (const redirect of redirects) {
    if (!redirect.passed) {
      add(
        'error',
        redirect.from,
        'Expected direct HTTP ' + redirect.expectedStatuses.join('/') + ' to ' + redirect.to,
      );
    }
    if (
      redirect.target &&
      (redirect.target.status !== 200 || !redirect.target.html || noindex(redirect.target))
    ) {
      add('error', redirect.to, 'Redirect destination is unavailable or noindex');
    }
  }
  return issues;
}
