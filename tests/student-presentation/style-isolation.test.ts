import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import type { CssRule } from './types';

const require = createRequire(import.meta.url);
const { parse } = createRequire(require.resolve('next/package.json'))('postcss');

describe('student style isolation', () => {
  it.each(['learning', 'lesson-images', 'lesson-typography'])(
    'never turns an excluded selector into an all-descendant reset in %s',
    (name) => {
      const root = parse(readFileSync(`src/app/${name}.css`, 'utf8'));
      const globalResets: string[] = [];
      root.walkRules((rule: CssRule) => {
        const selector = rule.selector.replace(/\s+/g, '');
        if (
          selector === ':where(.academy-theme,.academy-theme*)' ||
          selector === ':not(:where(.academy-theme,.academy-theme*))'
        ) {
          globalResets.push(rule.selector);
        }
      });
      expect(globalResets).toEqual([]);
    },
  );
});
