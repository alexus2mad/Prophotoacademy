import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const nextConvention =
  /^(page|route|layout|template|default|loading|error|global-error|not-found|global-not-found|forbidden|unauthorized|robots|sitemap|manifest|opengraph-image|twitter-image|icon|apple-icon|favicon)(\d*)\.(?:[cm]?[jt]sx?|mdx|xml|txt|json|webmanifest|ico|png|jpe?g|gif|svg|webp)$/;

function isEntry(file) {
  if (file.startsWith('src/app/')) return nextConvention.test(path.posix.basename(file));
  if (/^(?:src\/)?(?:instrumentation(?:-client)?|middleware|proxy)\.[jt]s$/.test(file)) return true;
  if (/^(?:next|sanity)\.config\.[cm]?[jt]s$/.test(file)) return true;
  if (/^(?:scripts|videos\/[^/]+\/scripts)\/.*\.(?:mjs|cjs|[jt]sx?)$/.test(file))
    return !/(?:\/types\.tsx|\.test\.mjs)$/.test(file);
  if (/^deploy\/(?!test_).*\.(?:sh|py|mjs|timer|service|conf)$/.test(file)) return true;
  return /^(?:supabase\/(?:migrations\/.*\.sql|templates\/.*\.html)|sanity\/[^/]+\/index\.ts|videos\/[^/]+\/index\.html|\.github\/workflows\/.*\.ya?ml)$/.test(
    file,
  );
}

function discover(root) {
  const files = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  )
    .split('\0')
    .filter((file) => file && existsSync(path.join(root, file)));
  const entries = new Set(files.filter(isEntry));
  for (const file of files.filter(
    (name) => name === 'package.json' || /^videos\/[^/]+\/package\.json$/.test(name),
  )) {
    for (const script of Object.keys(readJson(path.join(root, file)).scripts ?? {}))
      entries.add(file + '#' + script);
  }
  for (const cron of readJson(path.join(root, 'vercel.json')).crons ?? [])
    entries.add('vercel.json#' + cron.path);
  return entries;
}

function availableSpecs(root) {
  const changeRoot = path.join(root, 'openspec', 'changes');
  return [
    path.join(root, 'openspec', 'specs'),
    ...readdirSync(changeRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'archive')
      .map((entry) => path.join(changeRoot, entry.name, 'specs')),
  ];
}

export function checkCoverage(root) {
  const inventory = readJson(path.join(root, 'openspec', 'coverage.json'));
  const available = availableSpecs(root);
  const discovered = discover(root);
  const owners = new Map();
  const issues = [];
  for (const [capability, group] of Object.entries(inventory)) {
    if (
      !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(capability) ||
      !available.some((dir) => existsSync(path.join(dir, capability, 'spec.md')))
    )
      issues.push('Missing capability spec: ' + capability);
    if (
      !Array.isArray(group.evidence) ||
      !group.evidence.length ||
      !Array.isArray(group.entries) ||
      !group.entries.length
    )
      issues.push('Missing entries or evidence: ' + capability);
    for (const file of group.evidence ?? []) {
      if (!existsSync(path.join(root, file)))
        issues.push('Missing evidence for ' + capability + ': ' + file);
    }
    for (const entry of group.entries ?? []) {
      if (owners.has(entry)) issues.push('Duplicate owner: ' + entry);
      owners.set(entry, capability);
      if (!discovered.has(entry)) issues.push('Stale entry: ' + entry);
    }
  }
  for (const entry of discovered) if (!owners.has(entry)) issues.push('Unmapped entry: ' + entry);
  if (!owners.size) issues.push('Empty inventory');
  return { issues, entries: owners.size, capabilities: Object.keys(inventory).length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = checkCoverage(process.cwd());
  if (result.issues.length) {
    console.error(result.issues.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      `Coverage verified: ${result.entries} entry points, ${result.capabilities} capabilities.`,
    );
  }
}
