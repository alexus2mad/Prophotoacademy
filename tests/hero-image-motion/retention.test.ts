import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DependencyList, EffectCallback, SetStateAction, TransitionEvent } from 'react';
import { useHeroImageRetention } from '../../src/components/organisms/StudioHomeHero/hooks';

const lifecycle = vi.hoisted(() => ({
  retained: undefined as string[] | undefined,
  dependencies: undefined as DependencyList | undefined,
}));
vi.mock('react', () => ({
  useState(initial: string[]) {
    lifecycle.retained ??= initial;
    return [
      lifecycle.retained,
      (value: SetStateAction<string[]>) => {
        lifecycle.retained = typeof value === 'function' ? value(lifecycle.retained!) : value;
      },
    ];
  },
  useEffect(effect: EffectCallback, dependencies: DependencyList) {
    if (dependencies.some((value, index) => value !== lifecycle.dependencies?.[index])) {
      lifecycle.dependencies = dependencies;
      effect();
    }
  },
  useRef: vi.fn(),
}));

const render = (image: string, reduced = false) => {
  useHeroImageRetention(image, reduced);
  return useHeroImageRetention(image, reduced);
};

function transition(image: string, active = false, propertyName = 'opacity', child = false) {
  const layer = { dataset: { heroVisual: image, active: String(active) } };
  return {
    currentTarget: layer,
    target: child ? {} : layer,
    propertyName,
  } as unknown as TransitionEvent<HTMLDivElement>;
}

beforeEach(() => {
  lifecycle.retained = undefined;
  lifecycle.dependencies = undefined;
  vi.stubGlobal('getComputedStyle', () => ({ opacity: '0' }));
});
afterEach(() => vi.unstubAllGlobals());

describe('hero photograph retention', () => {
  it('holds the outgoing animation until opacity has fully faded', () => {
    render('studio');
    const fading = render('academy-0');
    expect(fading.retainedImages).toEqual(['studio', 'academy-0']);
    vi.stubGlobal('getComputedStyle', () => ({ opacity: '0.6' }));
    fading.onImageTransitionEnd(transition('studio'));
    expect(render('academy-0').retainedImages).toContain('studio');
    vi.stubGlobal('getComputedStyle', () => ({ opacity: '0' }));
    fading.onImageTransitionEnd(transition('studio'));
    expect(render('academy-0').retainedImages).toEqual(['academy-0']);
  });

  it('retains the current pose when a tab returns before its fade finishes', () => {
    render('studio');
    const oldFade = render('academy-0');
    render('studio');
    oldFade.onImageTransitionEnd(transition('studio', true));
    expect(render('studio').retainedImages).toContain('studio');
  });

  it('restarts a fully hidden image on its next activation', () => {
    render('studio');
    render('shop').onImageTransitionEnd(transition('studio'));
    expect(render('shop').retainedImages).not.toContain('studio');
    expect(render('studio').retainedImages).toContain('studio');
  });

  it('handles several interrupted fades without resetting a visible layer', () => {
    render('studio');
    render('academy-0');
    const final = render('shop');
    expect(final.retainedImages).toEqual(['studio', 'academy-0', 'shop']);
    final.onImageTransitionEnd(transition('studio'));
    final.onImageTransitionEnd(transition('academy-0'));
    expect(render('shop').retainedImages).toEqual(['shop']);
  });

  it('ignores descendant transitions, other properties and incoming fades', () => {
    render('studio');
    const fading = render('shop');
    fading.onImageTransitionEnd(transition('studio', false, 'transform'));
    fading.onImageTransitionEnd(transition('studio', false, 'opacity', true));
    fading.onImageTransitionEnd(transition('shop', true));
    expect(render('shop').retainedImages).toEqual(['studio', 'shop']);
  });

  it('clears hidden motion without needing transition events in reduced motion', () => {
    render('studio');
    render('shop');
    expect(render('shop', true).retainedImages).toEqual(['shop']);
    expect(render('academy-0', true).retainedImages).toEqual(['academy-0']);
  });
});
