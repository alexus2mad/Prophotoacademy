import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const checker = fileURLToPath(new URL('./check-links.mjs', import.meta.url));
const zero = '0'.repeat(40);
const change = 'adopt-openspec';
const marker = 'openspec/config.yaml';
const proposal = `openspec/changes/${change}`;

function fixture(t) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'prophoto-openspec-links-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: path.join(cwd, '.gitconfig-fixture'),
    GIT_CONFIG_NOSYSTEM: '1',
  };
  const run = (bin, args) => spawnSync(bin, args, { cwd, env, encoding: 'utf8' });
  function git(...args) {
    const result = run('git', args);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    return result.stdout.trim();
  }
  function put(name, value) {
    const file = path.join(cwd, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, value);
  }
  function commit(subject, id = change) {
    git('add', '-A');
    git('commit', '-qm', subject, ...(id ? ['-m', `OpenSpec-Change: ${id}`] : []));
    return git('rev-parse', 'HEAD');
  }
  function check(base = zero, head = 'HEAD') {
    const result = run(process.execPath, [checker, base, head]);
    assert.ifError(result.error);
    return result;
  }
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  put('page.txt', 'pre-adoption\n');
  const legacy = commit('Existing unlinked work', null);
  put(marker, 'schema: spec-driven\n');
  put(`${proposal}/proposal.md`, '# Adoption\n');
  const adoption = commit('Bootstrap OpenSpec');
  return { cwd, git, run, put, commit, check, legacy, adoption };
}

function passes(result) {
  assert.equal(result.status, 0, result.stderr);
}

function fails(result, error) {
  assert.equal(result.status, 1);
  assert.match(result.stderr, error);
}

test('direct pushes, first pushes, and PR ranges resolve active and archived changes in their own commit tree', (t) => {
  const { cwd, put, commit, check, adoption } = fixture(t);
  put('page.txt', 'linked change\n');
  commit('Update a page');
  const archive = 'openspec/changes/archive';
  mkdirSync(path.join(cwd, archive));
  renameSync(path.join(cwd, proposal), path.join(cwd, archive, `2026-11-21-${change}`));
  const archived = commit('Archive the change');
  put('page.txt', 'squash includes all the work\n');
  commit('Finish linked work');
  passes(check(adoption));
  passes(check(zero));
  passes(check(archived));
  passes(check('HEAD', 'HEAD'));
});

test('a missing trailer, a body mention, and an unknown or malformed ID fail even if a later commit is linked', (t) => {
  const { put, commit, check, adoption } = fixture(t);
  put('page.txt', 'missing\n');
  const missing = commit('Work without a trailer', null);
  put('page.txt', 'mentioned\n');
  commit(`Reference\n\nOpenSpec-Change: ${change}\n\nTrailing prose`, null);
  put('page.txt', 'unborn\n');
  const unknown = commit('A later proposal cannot authorize past work', 'later-proposal');
  put('openspec/changes/later-proposal/proposal.md', '# Later\n');
  put('page.txt', 'path\n');
  commit('Invalid identifier', '../adopt-openspec');
  put('page.txt', 'valid\n');
  commit('Another valid change');
  const failure = check(adoption);
  fails(failure, /add a Git trailer/);
  assert.match(failure.stderr, new RegExp(`${missing.slice(0, 12)}: add a Git trailer`));
  assert.match(
    failure.stderr,
    new RegExp(`${unknown.slice(0, 12)}: no active or dated archived proposal`),
  );
  assert.match(failure.stderr, /\.\.\/adopt-openspec/);
  fails(check(zero), /later-proposal/);
});

test('the adopted branch cannot drop its config', (t) => {
  const { cwd, commit, check, adoption } = fixture(t);
  rmSync(path.join(cwd, marker));
  commit('Remove governance');
  fails(check(adoption), /config.yaml was removed/);
});

test('a pull request from a diverged branch checks only commits introduced by that head', (t) => {
  const { git, put, commit, check, adoption } = fixture(t);
  put('base.txt', 'already reported on the base branch');
  const base = commit('Base-only commit', null);
  git('switch', '-qc', 'feature', adoption);
  put('feature.txt', 'new work');
  commit('Head-only commit');
  passes(check(base));
  put('feature.txt', 'more new work');
  commit('Unlinked head-only commit', null);
  fails(check(base), /add a Git trailer/);
});

test('a proposal must exist at the standard path and every declared change must resolve', (t) => {
  const { put, git, check, adoption } = fixture(t);
  put('openspec/changes/archive/not-a-date-nope/proposal.md', '# Incorrect path');
  put('openspec/changes/empty/tasks.md', '- [x] Done');
  git('add', '-A');
  git(
    'commit',
    '-qm',
    'Declare several changes',
    '-m',
    `OpenSpec-Change: ${change}\nOpenSpec-Change: nope\nOpenSpec-Change: empty`,
  );
  const result = check(adoption);
  fails(result, /"nope"/);
  assert.match(result.stderr, /"empty"/);
});

test('a clean merge passes without an extra trailer; a squash commit needs its own', (t) => {
  const { git, put, commit, check, adoption } = fixture(t);
  git('switch', '-qc', 'feature');
  put('feature.txt', 'feature');
  commit('Add a feature');
  git('switch', '-q', 'main');
  put('main.txt', 'main');
  commit('Main-side work');
  git('merge', '-q', '--no-ff', 'feature', '-m', 'Merge feature');
  passes(check(adoption));
  git('switch', '-qc', 'squash-target', adoption);
  git('merge', '-q', '--squash', 'feature');
  commit('Squash feature', null);
  fails(check(adoption), /add a Git trailer/);
});

test('merge conflict resolution needs a traceable change', (t) => {
  const { git, run, put, commit, check, adoption } = fixture(t);
  git('switch', '-qc', 'feature');
  put('page.txt', 'feature\n');
  commit('Feature-side work');
  git('switch', '-q', 'main');
  put('page.txt', 'main\n');
  commit('Main-side work');
  assert.equal(run('git', ['merge', '--no-ff', 'feature', '-m', 'Merge feature']).status, 1);
  put('page.txt', 'resolved work\n');
  commit('Resolve conflict', null);
  fails(check(adoption), /add a Git trailer/);
  git('commit', '--amend', '-qm', 'Resolve conflict', '-m', `OpenSpec-Change: ${change}`);
  passes(check(adoption));
});

test('the merge introducing a legacy branch is linked even if it merged cleanly', (t) => {
  const { git, put, commit, check, legacy, adoption } = fixture(t);
  git('switch', '-qc', 'old-work', legacy);
  put('legacy.txt', 'old change');
  commit('Legacy work', null);
  git('switch', '-q', 'main');
  git('merge', '-q', '--no-ff', 'old-work', '-m', 'Introduce old work');
  fails(check(adoption), /add a Git trailer/);
});
