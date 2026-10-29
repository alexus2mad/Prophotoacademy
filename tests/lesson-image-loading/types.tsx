import type { DependencyList, EffectCallback } from 'react';

export type HookEffect = {
  dependencies: DependencyList;
  cleanup: ReturnType<EffectCallback>;
};
export type PendingEffect = {
  index: number;
  callback: EffectCallback;
  dependencies: DependencyList;
};
export type ImageObserverCallback = (
  entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[],
) => void;
