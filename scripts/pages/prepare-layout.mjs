import ts from 'typescript';

// Change the review's server boundary structurally rather than matching source formatting.
export function prepareReviewLayout(text) {
  const source = ts.createSourceFile(
    'layout.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const factory = ts.factory;
  const transformed = ts.transform(source, [
    (context) => (root) => {
      function visit(node) {
        if (
          ts.isImportDeclaration(node) &&
          ['next/headers', '@/components/organisms/PreviewBanner/PreviewBanner'].includes(
            node.moduleSpecifier.text,
          )
        )
          return undefined;
        if (
          ts.isVariableStatement(node) &&
          node.declarationList.declarations.some(
            (declaration) => declaration.name.getText(source) === 'preview',
          )
        ) {
          const declarations = node.declarationList.declarations.filter(
            (declaration) => declaration.name.getText(source) !== 'preview',
          );
          if (!declarations.length) return undefined;
          return factory.updateVariableStatement(
            node,
            node.modifiers,
            factory.updateVariableDeclarationList(node.declarationList, declarations),
          );
        }
        if (
          ts.isVariableDeclaration(node) &&
          node.name.getText(source) === 'metadata' &&
          ts.isObjectLiteralExpression(node.initializer)
        ) {
          const robots = factory.createPropertyAssignment(
            'robots',
            factory.createObjectLiteralExpression([
              factory.createPropertyAssignment('index', factory.createFalse()),
              factory.createPropertyAssignment('follow', factory.createFalse()),
            ]),
          );
          return factory.updateVariableDeclaration(
            node,
            node.name,
            node.exclamationToken,
            node.type,
            factory.updateObjectLiteralExpression(node.initializer, [
              ...node.initializer.properties,
              robots,
            ]),
          );
        }
        if (
          ts.isJsxExpression(node) &&
          node.expression &&
          ts.isBinaryExpression(node.expression) &&
          ts.isJsxSelfClosingElement(node.expression.right) &&
          node.expression.right.tagName.getText(source) === 'PreviewBanner'
        ) {
          return factory.createJsxSelfClosingElement(
            factory.createIdentifier('ReviewNotice'),
            undefined,
            factory.createJsxAttributes([]),
          );
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(root, visit);
    },
  ]);
  const result =
    "import {ReviewNotice} from '@/components/organisms/ReviewNotice/ReviewNotice';\n" +
    ts.createPrinter().printFile(transformed.transformed[0]);
  transformed.dispose();
  return result;
}
