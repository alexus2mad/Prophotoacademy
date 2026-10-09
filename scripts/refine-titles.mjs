import ts from 'typescript';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...(await files(p)));
    else if (p.endsWith('.tsx')) results.push(p);
  }
  return results;
}
for (const file of await files('src')) {
  const text = await readFile(file, 'utf8');
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  function visit(node) {
    if (ts.isStringLiteral(node)) {
      let parent = node.parent;
      let heading = false;
      while (parent && !ts.isSourceFile(parent)) {
        if (
          ts.isJsxElement(parent) &&
          /^h[1-3]$/.test(parent.openingElement.tagName.getText(ast))
        ) {
          heading = true;
          break;
        }
        parent = parent.parent;
      }
      if (heading) {
        const original = node.getText(ast);
        const replacement = original.replace(/\.(?=["']$)/, '');
        if (original !== replacement)
          edits.push({ start: node.getStart(ast), end: node.end, replacement });
      }
    }
    if (ts.isJsxText(node)) {
      let parent = node.parent;
      let heading = false;
      while (parent && !ts.isSourceFile(parent)) {
        if (
          ts.isJsxElement(parent) &&
          /^h[1-3]$/.test(parent.openingElement.tagName.getText(ast))
        ) {
          heading = true;
          break;
        }
        parent = parent.parent;
      }
      if (heading) {
        const original = text.slice(node.pos, node.end);
        const replacement = original.replace(/\.(?=\s*$)/, '');
        if (original !== replacement) edits.push({ start: node.pos, end: node.end, replacement });
      }
    }
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(ast) === 'title' &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const original = node.initializer.getText(ast);
      const replacement = original.replace(/\.(?=["']$)/, '');
      if (original !== replacement)
        edits.push({
          start: node.initializer.getStart(ast),
          end: node.initializer.end,
          replacement,
        });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  let result = text;
  for (const edit of edits.sort((a, b) => b.start - a.start))
    result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
  if (result !== text) {
    await writeFile(file, result);
    console.log(`Refined heading punctuation: ${file}`);
  }
}
const file = 'content/academy.json';
const content = JSON.parse(await readFile(file, 'utf8'));
function clean(value) {
  if (Array.isArray(value)) value.forEach(clean);
  else if (value && typeof value === 'object')
    for (const [key, v] of Object.entries(value)) {
      if (['title', 'shortTitle', 'heroTitle'].includes(key) && typeof v === 'string')
        value[key] = v.replace(/\.+\s*$/, '');
      else clean(v);
    }
}
clean(content);
await writeFile(file, JSON.stringify(content, null, 2));
