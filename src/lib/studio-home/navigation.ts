import type { StudioHomeMode } from './types';

export const studioHomeBrandFragments = {
  academy: '#home-academy',
  studio: '#home-studio',
  shop: '#home-shop',
} as const satisfies Record<StudioHomeMode, string>;

export function studioHomeBrandHref(mode: StudioHomeMode) {
  return `/${studioHomeBrandFragments[mode]}`;
}

export function studioHomeBrandForFragment(hash: string): StudioHomeMode | undefined {
  if (hash === studioHomeBrandFragments.academy) return 'academy';
  if (hash === studioHomeBrandFragments.studio) return 'studio';
  if (hash === studioHomeBrandFragments.shop) return 'shop';
}

export function studioHomeModeForFragment(hash: string): StudioHomeMode {
  return studioHomeBrandForFragment(hash) ?? studioHomeSectionBrand(hash) ?? 'academy';
}

export function studioHomeSectionBrand(hash: string): StudioHomeMode | undefined {
  if (hash === '#education-id') return 'academy';
  if (hash === '#equipment-selection') return 'shop';
  if (['#spaces', '#cyclorama', '#content-room', '#makeup', '#studio-booking'].includes(hash)) {
    return 'studio';
  }
}
