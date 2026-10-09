import ts from 'typescript';
import path from 'node:path';

const ranks = { atoms: 0, molecules: 1, organisms: 2, templates: 3 };
const normalized = (value) => value.replaceAll('\\', '/');

export function inspectModule(file, text) {
  file = normalized(file);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const errors = [];
  const report = (node, message) =>
    errors.push(
      `${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1} ${message}`,
    );
  const basename = path.posix.basename(file);
  const typesFile = basename === 'types.tsx';
  const hooksFile = basename === 'hooks.tsx';
  const componentMatch = file.match(
    /^src\/components\/(atoms|molecules|organisms|templates|behaviors)\/([^/]+)\/([^/]+)$/,
  );
  const layer = componentMatch?.[1];
  const runtimeImports = [];
  let components = 0;

  if (file.startsWith('src/components/') && !componentMatch)
    errors.push(`${file} Components must live in a layer/component folder`);
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const clause = statement.importClause;
    const named = clause?.namedBindings;
    const typeOnly =
      clause?.isTypeOnly ||
      (named && ts.isNamedImports(named) && named.elements.every((item) => item.isTypeOnly));
    if (typesFile && clause && !typeOnly) report(statement, 'Types must use import type');
    const target = statement.moduleSpecifier.text;
    const resolvedTarget = target.startsWith('@/')
      ? 'src/' + target.slice(2)
      : target.startsWith('.')
        ? path.posix.normalize(path.posix.join(path.posix.dirname(file), target))
        : target;
    const targetLayer = resolvedTarget.match(/^src\/components\/(\w+)\//)?.[1];
    if (layer in ranks && targetLayer in ranks && ranks[targetLayer] > ranks[layer])
      report(statement, `A ${layer} module cannot depend on ${targetLayer}`);
    if (typeOnly) continue;
    runtimeImports.push(target);
    if (
      layer &&
      (/^src\/app\//.test(resolvedTarget) ||
        /^node:/.test(target) ||
        /^@sanity\//.test(target) ||
        target === 'next/headers' ||
        resolvedTarget === 'src/lib/content')
    )
      report(statement, 'UI must receive data instead of importing a server transport');
    if (!hooksFile && !target.endsWith('/hooks') && named && ts.isNamedImports(named))
      for (const item of named.elements)
        if (/^use[A-Z]/.test((item.propertyName || item.name).text))
          report(item, 'Hook implementations and built-in hook imports belong in hooks.tsx');
  }

  function visit(node) {
    if (
      !typesFile &&
      (ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeLiteralNode(node))
    )
      report(node, 'Project type contracts belong in types.tsx');
    if (
      hooksFile &&
      (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node))
    )
      report(node, 'Hooks contain behavior, not JSX');
    if (
      typesFile &&
      (ts.isFunctionDeclaration(node) ||
        ts.isVariableStatement(node) ||
        ts.isClassDeclaration(node) ||
        ts.isJsxElement(node))
    )
      report(node, 'Types files must not contain runtime implementation');
    if (ts.isFunctionDeclaration(node) && node.name) {
      if (/^use[A-Z]/.test(node.name.text) && !hooksFile)
        report(node, 'Custom hooks belong in hooks.tsx');
      if (componentMatch && !typesFile && !hooksFile && /^[A-Z]/.test(node.name.text)) {
        components++;
        if (basename !== `${node.name.text}.tsx`) report(node, 'Component and filename must match');
      }
    }
    if (
      !hooksFile &&
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      /^use[A-Z]/.test(node.expression.name.text)
    )
      report(node, 'React hook calls belong in hooks.tsx');
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (components > 1) errors.push(`${file} Keep one component per file`);
  return { errors, runtimeImports };
}

export function findImportCycles(graph) {
  const active = new Set(),
    visited = new Set(),
    stack = [],
    cycles = [];
  function visit(file) {
    if (active.has(file)) {
      cycles.push([...stack.slice(stack.indexOf(file)), file]);
      return;
    }
    if (visited.has(file)) return;
    active.add(file);
    stack.push(file);
    for (const dependency of graph.get(file) || []) if (graph.has(dependency)) visit(dependency);
    stack.pop();
    active.delete(file);
    visited.add(file);
  }
  for (const file of graph.keys()) visit(file);
  return cycles;
}
