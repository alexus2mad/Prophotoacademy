import { AsyncLocalStorage } from 'node:async_hooks';
import type { EditorTarget } from './types';

// One request works on one environment's marketing content; nested calls inherit it.
const scope = new AsyncLocalStorage<EditorTarget>();

export const currentTarget = (): EditorTarget => scope.getStore() ?? 'production';

export function runInTarget<T>(target: EditorTarget, work: () => T): T {
  return scope.run(target, work);
}

export const parseTarget = (value: unknown): EditorTarget =>
  value === 'staging' ? 'staging' : 'production';
