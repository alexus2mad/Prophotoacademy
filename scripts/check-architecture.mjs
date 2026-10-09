import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectModule, findImportCycles } from './architecture/rules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const file = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(file)));
    else if (/\.tsx?$/.test(file) && !file.endsWith('.d.ts')) files.push(file);
  }
  return files;
}
const files = (await Promise.all(['src', 'sanity', 'scripts', 'tests'].map(walk))).flat();
const known = new Set(files),
  graph = new Map(),
  errors = [];
for (const file of files) {
  const result = inspectModule(file, await readFile(path.join(root, file), 'utf8'));
  errors.push(...result.errors);
  const dependencies = result.runtimeImports.flatMap((target) => {
    const base = target.startsWith('@/')
      ? 'src/' + target.slice(2)
      : target.startsWith('.')
        ? path.posix.normalize(path.posix.join(path.posix.dirname(file), target))
        : null;
    if (!base) return [];
    const resolved = [base, base + '.tsx', base + '.ts', base + '/index.ts'].find((candidate) =>
      known.has(candidate),
    );
    return resolved ? [resolved] : [];
  });
  graph.set(file, dependencies);
}
for (const cycle of findImportCycles(graph))
  errors.push('Runtime import cycle: ' + cycle.join(' → '));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Architecture verified: ${files.length} modules, colocated types/hooks, atomic dependencies and no runtime cycles`,
  );
