import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Files an agent reads as its instructions. Generated OpenSpec skills are upstream and not listed.
const instructionFile =
  /^(?:(?:.*\/)?(?:AGENTS|CLAUDE)\.md|\.github\/copilot-instructions\.md|\.github\/instructions\/[^/]+\.md|\.claude\/agents\/[^/]+\.md|\.codex\/agents\/[^/]+\.toml)$/;

function discover(root) {
  // Tracked and unignored files, as in the coverage check; ignored generated copies are skipped.
  const files = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  return [...new Set(files.split('\0').filter(Boolean))].filter((file) =>
    instructionFile.test(file),
  );
}

export function checkAgentRules(root) {
  const files = discover(root).sort();
  const issues = [];
  for (const file of files) {
    let text;
    try {
      text = readFileSync(path.join(root, file), 'utf8');
    } catch {
      continue; // Deleted in the working tree but still in the index.
    }
    if (!/OpenSpec/.test(text) || !/\bmandatory\b/i.test(text)) {
      issues.push(`${file}: state that spec-driven development with OpenSpec is mandatory`);
    } else if (file !== 'AGENTS.md' && !/AGENTS\.md/.test(text)) {
      issues.push(`${file}: link the root AGENTS.md workflow`);
    }
  }
  if (!files.includes('AGENTS.md')) issues.push('AGENTS.md: the root workflow is missing');
  return { issues, files: files.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = checkAgentRules(process.cwd());
  if (result.issues.length) {
    console.error(result.issues.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Agent rules verified: ${result.files} instruction files require OpenSpec.`);
  }
}
