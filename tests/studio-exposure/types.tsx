import type { DependencyList, EffectCallback } from 'react';

export type ExposureEffect = { dependencies: DependencyList; cleanup: ReturnType<EffectCallback> };
export type PendingExposureEffect = {
  index: number;
  callback: EffectCallback;
  dependencies: DependencyList;
};
