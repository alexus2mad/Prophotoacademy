import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { studioAssetUrl } from '../src/lib/studio-design/urls';
import { StudioHomePicture } from '../src/components/molecules/StudioHomePicture/StudioHomePicture';
import { studioAssets } from '../src/lib/studio-design/assets';

afterEach(() => vi.unstubAllEnvs());

describe('Studio public asset URLs', () => {
  it('preserves live assets without a deployment prefix', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    expect(studioAssetUrl('/design/studio/portrait.webp')).toBe('/design/studio/portrait.webp');
  });

  it('prefixes repository assets once and preserves external CMS images', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/Prophotoacademy');
    expect(studioAssetUrl('/design/studio/portrait.webp')).toBe(
      '/Prophotoacademy/design/studio/portrait.webp',
    );
    expect(studioAssetUrl('/Prophotoacademy/images/portrait.webp')).toBe(
      '/Prophotoacademy/images/portrait.webp',
    );
    expect(studioAssetUrl('https://cdn.sanity.io/images/project/image.jpg')).toBe(
      'https://cdn.sanity.io/images/project/image.jpg',
    );
    expect(studioAssetUrl('//cdn.example.org/image.jpg')).toBe('//cdn.example.org/image.jpg');
  });

  it('renders both art-directed sources under the review path', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/Prophotoacademy');
    const $ = load(
      renderToStaticMarkup(
        createElement(StudioHomePicture, {
          image: studioAssets.home.imgImgHome144001,
          mobileImage: studioAssets.homeMobile.imgImgHome39001,
          alt: 'Портрет',
        }),
      ),
    );
    expect($('source').attr('srcset')).toBe(
      `/Prophotoacademy${studioAssets.homeMobile.imgImgHome39001.src}`,
    );
    const imageUrl = new URL($('img').attr('src')!, 'https://example.test');
    expect(imageUrl.searchParams.get('url') || imageUrl.pathname).toBe(
      `/Prophotoacademy${studioAssets.home.imgImgHome144001.src}`,
    );
  });
});
