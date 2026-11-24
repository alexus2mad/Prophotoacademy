#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');

const name = 'prophoto-editor';
const files = ['SKILL.md', 'agents/openai.yaml'];
const receipt = '.prophoto-install.json';
const roots = { codex: '.agents', claude: '.claude' };
const usage = 'Usage: prophoto-editor [--target codex|claude|both]';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function targets(args) {
  if (args.length === 0) return Object.keys(roots);
  if (args.length === 2 && args[0] === '--target') {
    if (args[1] === 'both') return Object.keys(roots);
    if (Object.hasOwn(roots, args[1])) return [args[1]];
  }
  throw new Error(usage);
}

function validHashes(hashes) {
  return (
    hashes !== null &&
    typeof hashes === 'object' &&
    Object.keys(hashes).length === files.length &&
    files.every((file) => typeof hashes[file] === 'string' && /^[a-f0-9]{64}$/.test(hashes[file]))
  );
}

function packagedSkill() {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'skill-manifest.json'), 'utf8'));
  if (!validHashes(manifest.files)) throw new Error('Invalid skill package manifest.');
  const content = {};
  for (const file of files) {
    content[file] = fs.readFileSync(path.join(__dirname, 'skill', file));
    if (sha256(content[file]) !== manifest.files[file])
      throw new Error(`Package checksum mismatch for ${file}.`);
  }
  return { content, hashes: manifest.files };
}

function conflict(location) {
  throw new Error(`Local content at ${location}. Back up or move your copy before installing.`);
}

function stat(location) {
  return fs.lstatSync(location, { throwIfNoEntry: false });
}

function readReceipt(directory) {
  const location = path.join(directory, receipt);
  const entry = stat(location);
  if (!entry) return null;
  if (!entry.isFile()) conflict(location);
  try {
    const saved = JSON.parse(fs.readFileSync(location, 'utf8'));
    if (saved?.name === name && validHashes(saved.files)) return saved.files;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  conflict(location);
}

function plan(directory, hashes) {
  const existing = stat(directory);
  if (!existing) return { directory, action: 'install', changed: files };
  if (!existing.isDirectory()) conflict(directory);
  const agents = path.join(directory, 'agents');
  const agentsEntry = stat(agents);
  if (agentsEntry && !agentsEntry.isDirectory()) conflict(agents);
  const previous = readReceipt(directory);
  const changed = [];
  for (const file of files) {
    const location = path.join(directory, file);
    if (!stat(location)?.isFile()) conflict(location);
    const actual = sha256(fs.readFileSync(location));
    if (actual === hashes[file]) continue;
    if (actual !== previous?.[file]) conflict(location);
    changed.push(file);
  }
  const current = previous && files.every((file) => previous[file] === hashes[file]);
  return { directory, action: current && !changed.length ? 'current' : 'update', changed };
}

function install({ directory, action, changed }, { hashes, content }) {
  if (action === 'current') return;
  const parent = path.dirname(directory);
  fs.mkdirSync(parent, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(parent, '.prophoto-editor-'));
  try {
    for (const file of changed) {
      const location = path.join(temporary, file);
      fs.mkdirSync(path.dirname(location), { recursive: true });
      fs.writeFileSync(location, content[file]);
    }
    fs.writeFileSync(path.join(temporary, receipt), JSON.stringify({ name, files: hashes }) + '\n');
    if (action === 'install') {
      fs.renameSync(temporary, directory);
    } else {
      // Commit the receipt last. A retry accepts files from either release.
      for (const file of [...changed, receipt]) {
        fs.renameSync(path.join(temporary, file), path.join(directory, file));
      }
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function main(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(
      `${usage}\nInstalls the ProPhoto editor skill for the current user. The default is both agents.`,
    );
    return;
  }
  const selected = targets(args);
  const skill = packagedSkill();
  const plans = selected.map((target) =>
    plan(path.join(os.homedir(), roots[target], 'skills', name), skill.hashes),
  );
  for (const step of plans) {
    install(step, skill);
    const label = { current: 'Already installed', install: 'Installed', update: 'Updated' }[
      step.action
    ];
    console.log(`${label}: ${step.directory}`);
  }
  console.log('Start a new agent session to use the prophoto-editor skill.');
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
