import { describe, expect, it } from 'vitest';
import { prepareReviewLayout } from '../scripts/pages/prepare-layout.mjs';

const layout = `
import {draftMode} from 'next/headers';
import {PreviewBanner} from '@/components/organisms/PreviewBanner/PreviewBanner';
export const metadata={title:'ProPhoto'};
export default async function RootLayout({children}:LayoutProps){
 const preview=(await draftMode()).isEnabled;
 return <html lang="uk"><body>{preview&&<PreviewBanner/>}{children}</body></html>;
}`;

describe('review layout preparation', () => {
  it('removes draft-only imports and state while preserving the document and child slots', () => {
    const result = prepareReviewLayout(layout);
    expect(result).not.toContain('draftMode');
    expect(result).not.toContain('PreviewBanner');
    expect(result).not.toContain('const preview');
    expect(result).toContain('<ReviewNotice');
    expect(result).toContain('index: false');
    expect(result).toContain('follow: false');
    expect(result).toContain('lang="uk"');
    expect(result).toContain('{children}');
  });
  it('adapts equivalent formatted source without relying on exact text fragments', () => {
    const formatted = layout.replaceAll('=', ' = ').replaceAll('&&', ' && ');
    expect(prepareReviewLayout(formatted)).toBe(prepareReviewLayout(layout));
  });
});
