import { academyIndexMetadata } from '@/lib/seo/metadata';
import { academyDesign } from '@/lib/studio-design/variant';

// Live requests redirect before rendering. GitHub Pages keeps the old URL reviewable.
export { default } from '../academy/page';

export function generateMetadata() {
  return academyIndexMetadata(academyDesign(), true);
}
