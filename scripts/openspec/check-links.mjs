import { execFileSync } from 'node:child_process';

const [base, head] = process.argv.slice(2);
if (!base || !head) {
  console.error(
    'Usage: node scripts/openspec/check-links.mjs <base-revision-or-zero-sha> <head-revision>',
  );
  process.exit(2);
}

function git(args, input) {
  return execFileSync('git', args, { encoding: 'utf8', input, maxBuffer: 32 * 1024 * 1024 });
}

function revision(name) {
  return git(['rev-parse', '--verify', '--end-of-options', `${name}^{commit}`]).trim();
}

function lines(value) {
  return value.trim().split(/\r?\n/).filter(Boolean);
}

function hasChangesOfItsOwn(commit, parents) {
  if (parents.length === 1) {
    return git(['diff-tree', '--no-commit-id', '--name-only', '-r', parents[0], commit]) !== '';
  }
  if (parents.length === 2) {
    // A clean merge just carries the already checked commits. A resolution can add new work.
    return git(['show', '--remerge-diff', '--format=', '--name-only', commit]) !== '';
  }
  // Git cannot remerge an octopus for comparison. Conservatively require a reference.
  return true;
}

function proposalIds(commit) {
  const names = git(['ls-tree', '-r', '-z', '--name-only', commit, '--', 'openspec/changes']);
  const ids = new Set();
  for (const name of names.split('\0')) {
    const match =
      /^openspec\/changes\/(?:archive\/\d{4}-\d{2}-\d{2}-)?([a-z0-9]+(?:-[a-z0-9]+)*)\/proposal\.md$/.exec(
        name,
      );
    if (match && match[1] !== 'archive') ids.add(match[1]);
  }
  return ids;
}

function checkHistory() {
  const tip = revision(head);
  // On creation GitHub supplies a null before-SHA. Walk the new head's whole history;
  // restricting it to the current default branch would miss unlinked new-branch commits.
  const range = /^0{40}(?:0{24})?$/.test(base) ? [tip] : [tip, `^${revision(base)}`];
  const commits = lines(git(['log', '--reverse', '--format=%H %P', ...range, '--'])).map((line) =>
    line.trim().split(/ +/),
  );
  if (!commits.length) return;

  const revisions = [...new Set(commits.flat())];
  const queries = revisions.map((id) => `${id}:openspec/config.yaml`).join('\n');
  const types = lines(git(['cat-file', '--batch-check=%(objecttype)'], `${queries}\n`));
  const adopted = new Set(revisions.filter((_, index) => types[index] === 'blob'));

  const errors = [];
  let checked = 0;
  for (const [commit, ...parents] of commits) {
    if (!adopted.has(parents[0])) continue;
    const label = commit.slice(0, 12);
    if (!adopted.has(commit)) {
      errors.push(`${label}: openspec/config.yaml was removed after adoption`);
      continue;
    }
    // Introducing work from a branch predating adoption also needs a traceable merge.
    if (parents.every((parent) => adopted.has(parent)) && !hasChangesOfItsOwn(commit, parents))
      continue;
    checked++;
    const trailers = lines(
      git(['show', '-s', '--format=%(trailers:key=OpenSpec-Change,valueonly)', commit]),
    );
    if (!trailers.length) {
      errors.push(`${label}: add a Git trailer on its own line: OpenSpec-Change: <change-id>`);
      continue;
    }
    const proposals = proposalIds(commit);
    for (const id of trailers) {
      if (!proposals.has(id))
        errors.push(
          `${label}: no active or dated archived proposal for ${JSON.stringify(id)} in this commit`,
        );
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`OpenSpec links verified for ${checked} post-adoption commits with changes.`);
}

try {
  checkHistory();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
