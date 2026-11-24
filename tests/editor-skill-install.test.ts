import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

let temporary: string;
let home: string;
let bundle: string;
const documents = { 'SKILL.md': 'Original content', 'agents/openai.yaml': 'display: demo' };

function pack(documents: Record<string, string>) {
  const hashes: Record<string, string> = {};
  for (const [relative, contents] of Object.entries(documents)) {
    const destination = path.join(bundle, 'skill', relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, contents);
    hashes[relative] = createHash('sha256').update(contents).digest('hex');
  }
  writeFileSync(path.join(bundle, 'skill-manifest.json'), JSON.stringify({ files: hashes }));
}

function install(...args: string[]) {
  return spawnSync(process.execPath, [path.join(bundle, 'install.cjs'), ...args], {
    encoding: 'utf8',
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
}

const destination = (agent: '.agents' | '.claude', file = '') =>
  path.join(home, agent, 'skills', 'prophoto-editor', file);

beforeEach(() => {
  temporary = mkdtempSync(path.join(tmpdir(), 'prophoto-cli-'));
  home = path.join(temporary, 'user home');
  bundle = path.join(temporary, 'package');
  pack(documents);
  cpSync('scripts/editor-skill/install.cjs', path.join(bundle, 'install.cjs'));
});

afterEach(() => rmSync(temporary, { recursive: true, force: true }));

describe('personal editor skill installer', () => {
  it('installs into both agent discovery paths and repeats without changes', () => {
    expect(install().status).toBe(0);
    for (const target of ['.agents', '.claude'] as const) {
      for (const [file, contents] of Object.entries(documents)) {
        expect(readFileSync(destination(target, file), 'utf8')).toBe(contents);
      }
    }
    const again = install();
    expect(again.status).toBe(0);
    expect(again.stdout.match(/Already installed/g)).toHaveLength(2);
  });

  it.each([
    ['codex', '.agents', '.claude'],
    ['claude', '.claude', '.agents'],
  ] as const)('limits installation to %s when selected', (target, present, absent) => {
    expect(install('--target', target).status).toBe(0);
    expect(existsSync(destination(present))).toBe(true);
    expect(existsSync(destination(absent))).toBe(false);
  });

  it('rejects a corrupt payload before creating any agent directories', () => {
    writeFileSync(path.join(bundle, 'skill', 'SKILL.md'), 'wrong');
    const result = install();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('checksum mismatch');
    expect(existsSync(home)).toBe(false);
  });

  it('updates managed files while preserving unrelated personal files', () => {
    expect(install().status).toBe(0);
    writeFileSync(destination('.agents', 'notes.md'), 'personal');
    pack({ ...documents, 'SKILL.md': 'Second edition' });
    expect(install().status).toBe(0);
    expect(readFileSync(destination('.agents', 'SKILL.md'), 'utf8')).toBe('Second edition');
    expect(readFileSync(destination('.agents', 'notes.md'), 'utf8')).toBe('personal');
  });

  it('detects local edits in either target before changing the other', () => {
    expect(install().status).toBe(0);
    writeFileSync(destination('.claude', 'SKILL.md'), 'my local edits');
    pack({ ...documents, 'SKILL.md': 'Second edition' });
    const result = install('--target', 'both');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Local content');
    expect(readFileSync(destination('.agents', 'SKILL.md'), 'utf8')).toBe(documents['SKILL.md']);
    expect(readFileSync(destination('.claude', 'SKILL.md'), 'utf8')).toBe('my local edits');
  });

  it('recovers an interrupted update after one managed file has been replaced', () => {
    expect(install('--target', 'codex').status).toBe(0);
    const revised = { 'SKILL.md': 'Second edition', 'agents/openai.yaml': 'display: updated' };
    pack(revised);
    writeFileSync(destination('.agents', 'SKILL.md'), revised['SKILL.md']);
    expect(install('--target', 'codex').status).toBe(0);
    expect(readFileSync(destination('.agents', 'agents/openai.yaml'), 'utf8')).toBe(
      revised['agents/openai.yaml'],
    );
    expect(install('--target', 'codex').stdout).toContain('Already installed');
  });

  it('leaves a conflicting manual installation untouched', () => {
    mkdirSync(destination('.claude'), { recursive: true });
    writeFileSync(destination('.claude', 'SKILL.md'), 'handwritten skill');
    expect(install().status).toBe(1);
    expect(existsSync(destination('.agents'))).toBe(false);
    expect(readFileSync(destination('.claude', 'SKILL.md'), 'utf8')).toBe('handwritten skill');
  });

  it('prints CLI help and rejects unknown options without writing files', () => {
    const help = install('--help');
    expect(help.status).toBe(0);
    expect(help.stdout).toContain('--target codex|claude|both');
    expect(install('--target', '../other').status).toBe(1);
    expect(existsSync(home)).toBe(false);
  });
});
