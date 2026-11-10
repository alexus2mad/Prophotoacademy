import type { Mock } from 'vitest';

export type TestBrowser = EventTarget & { innerHeight: number };
export type TestDocument<TElement> = EventTarget & {
  hidden: boolean;
  activeElement: TElement | null;
  documentElement: { clientWidth: number };
  elementFromPoint: Mock<() => TElement | null>;
};
