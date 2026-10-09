import { describe, expect, it } from 'vitest';
import { inspectModule, findImportCycles } from '../scripts/architecture/rules.mjs';

describe('architecture boundaries', () => {
  it('rejects upward dependencies while permitting domain type-only contracts', () => {
    expect(
      inspectModule(
        'src/components/atoms/Logo/Logo.tsx',
        "import {Header} from '@/components/organisms/Header/Header';",
      ).errors,
    ).toHaveLength(1);
    expect(
      inspectModule(
        'src/components/atoms/Logo/types.tsx',
        "import type {ImageAsset} from '@/lib/content/types';export type Props=ImageAsset;",
      ).errors,
    ).toEqual([]);
    expect(
      inspectModule(
        'src/components/atoms/Logo/Logo.tsx',
        "import {Header} from '../../organisms/Header/Header';",
      ).errors,
    ).toHaveLength(1);
  });
  it('rejects inline contracts and colocates named types', () => {
    expect(
      inspectModule('src/lib/example.ts', 'export type Result={ok:boolean};').errors.length,
    ).toBeGreaterThan(0);
    expect(
      inspectModule('src/lib/example/types.tsx', 'export type Result={ok:boolean};').errors,
    ).toEqual([]);
  });
  it('catches aliased hook imports in component files', () => {
    expect(
      inspectModule(
        'src/components/atoms/Logo/Logo.tsx',
        "import {useEffect as effect} from 'react';",
      ).errors,
    ).toHaveLength(1);
  });
  it('keeps rendering out of hooks and runtime implementation out of types', () => {
    expect(
      inspectModule(
        'src/components/organisms/Form/hooks.tsx',
        'export function useForm(){return <form/>;}',
      ).errors.length,
    ).toBeGreaterThan(0);
    expect(
      inspectModule('src/lib/example/types.tsx', 'export const value=42;').errors,
    ).toHaveLength(1);
  });
  it('rejects multiple components in one file', () => {
    const result = inspectModule(
      'src/components/atoms/Logo/Logo.tsx',
      'export function Logo(){return <img/>;}function Other(){return <span/>;}',
    );
    expect(result.errors.some((message) => message.includes('one component'))).toBe(true);
  });
  it('keeps server transports outside the presentation tree', () => {
    expect(
      inspectModule(
        'src/components/molecules/Card/Card.tsx',
        "import {getContent} from '@/lib/content';",
      ).errors,
    ).toHaveLength(1);
  });
  it('reports cyclic runtime imports but accepts a composed dependency graph', () => {
    expect(
      findImportCycles(
        new Map([
          ['a', ['b']],
          ['b', ['a']],
        ]),
      ),
    ).toEqual([['a', 'b', 'a']]);
    expect(
      findImportCycles(
        new Map([
          ['organism', ['molecule']],
          ['molecule', ['atom']],
          ['atom', []],
        ]),
      ),
    ).toEqual([]);
  });
});
