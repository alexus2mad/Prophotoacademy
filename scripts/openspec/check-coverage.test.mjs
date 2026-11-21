import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkCoverage } from './check-coverage.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'academy-spec-coverage-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', root]);
  function write(name, value) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), value);
  }
  write('openspec/changes/archive/.gitkeep', '');
  write('openspec/specs/catalog/spec.md', '# Catalog');
  write('vercel.json', '{"crons":[]}');
  write('src/app/page.tsx', '');
  const inventory = { catalog: { entries: ['src/app/page.tsx'], evidence: ['src/app/page.tsx'] } };
  const check = () => {
    write('openspec/coverage.json', JSON.stringify(inventory));
    return checkCoverage(root);
  };
  return { check, inventory, root, write };
}

test('maps checked-out routes and flags new dynamic handlers, jobs and script commands', (t) => {
  const { check, write } = fixture(t);
  assert.deepEqual(check().issues, []);
  write('src/app/api/orders/[id]/route.ts', '');
  write('package.json', '{"scripts":{"job":"node job.mjs"}}');
  write('vercel.json', '{"crons":[{"path":"/api/jobs","schedule":"* * * * *"}]}');
  assert.deepEqual(check().issues.sort(), [
    'Unmapped entry: package.json#job',
    'Unmapped entry: src/app/api/orders/[id]/route.ts',
    'Unmapped entry: vercel.json#/api/jobs',
  ]);
});

test('detects stale owners, missing evidence, duplicate assignments and dangling capability IDs', (t) => {
  const { check, inventory } = fixture(t);
  inventory.typo = { entries: ['src/app/page.tsx', 'removed.ts'], evidence: ['missing.md'] };
  assert.deepEqual(
    new Set(check().issues),
    new Set([
      'Missing capability spec: typo',
      'Missing evidence for typo: missing.md',
      'Duplicate owner: src/app/page.tsx',
      'Stale entry: removed.ts',
    ]),
  );
});

test('recognizes a proposed capability during implementation and excludes archive-only specs', (t) => {
  const { check, inventory, write } = fixture(t);
  inventory.checkout = inventory.catalog;
  delete inventory.catalog;
  write('openspec/changes/archive/2026-11-21-old/specs/checkout/spec.md', '# old');
  assert.deepEqual(check().issues, ['Missing capability spec: checkout']);
  write('openspec/changes/new-checkout/specs/checkout/spec.md', '# proposed');
  assert.deepEqual(check().issues, []);
});
