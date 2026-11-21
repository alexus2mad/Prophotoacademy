import type { StudioAsset } from '@/lib/studio-design/types';
import type { SitePage, SiteSection } from './types';

export function bindSection(page: SitePage | undefined, original: SiteSection) {
  const section = page?.sections.find((item) => item.id === original.id);
  function text(id: string): string {
    return (
      section?.fields.find((field) => field.id === id)?.value ??
      original.fields.find((field) => field.id === id)?.value ??
      ''
    );
  }
  function image(id: string, asset: StudioAsset): StudioAsset {
    const src = text(id);
    return src && src !== asset.src ? { ...asset, src } : asset;
  }
  return { text, image };
}
