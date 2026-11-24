import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkAgentRules } from './check-agent-rules.mjs';

const mandate =
  'Spec-driven development with OpenSpec is mandatory. Follow [AGENTS.md](AGENTS.md).';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'academy-agent-rules-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', root]);
  const write = (name, value) => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), value);
  };
  write('AGENTS.md', '# Rules\n\nOpenSpec is mandatory for every agent.\n');
  write('CLAUDE.md', mandate);
  write('src/lib/AGENTS.md', mandate);
  write('.claude/agents/curator.md', mandate);
  write('.codex/agents/curator.toml', `developer_instructions = """${mandate}"""`);
  write('.github/copilot-instructions.md', mandate);
  return { root, write, check: () => checkAgentRules(root) };
}

test('accepts instruction files that state the mandate', (t) => {
  const { check } = fixture(t);
  assert.deepEqual(check(), { issues: [], files: 6 });
});

test('names instruction files without the mandate or the root link', (t) => {
  const { check, write } = fixture(t);
  write('videos/demo/CLAUDE.md', '# Composition project\n\nUse the skills first.\n');
  write('.claude/agents/helper.md', 'OpenSpec is mandatory for this helper.');
  write('docs/guide.md', 'Not an instruction file.');
  assert.deepEqual(check().issues, [
    '.claude/agents/helper.md: link the root AGENTS.md workflow',
    'videos/demo/CLAUDE.md: state that spec-driven development with OpenSpec is mandatory',
  ]);
});

test('requires the root workflow and skips ignored generated copies', (t) => {
  const { check, root, write } = fixture(t);
  write('.gitignore', '.pages-build/\n');
  write('.pages-build/src/lib/AGENTS.md', '# Copy without the rule');
  rmSync(path.join(root, 'AGENTS.md'));
  assert.deepEqual(check().issues, ['AGENTS.md: the root workflow is missing']);
});
