import { studioIntensiveBlocks } from '@/lib/studio-pages/intensive';
import { siteField, siteSection } from '../../fields';

export const artworkCurriculum = siteSection('curriculum', 'Програма інтенсиву', [
  siteField('eyebrow', 'Надзаголовок', 'Програма · 4–5 годин'),
  siteField('title', 'Заголовок', 'Як проходить'),
  siteField('emphasis', 'Акцент заголовка', '*інтенсив'),
  siteField('block-label', 'Блок · Підпис', 'Блок'),
  ...studioIntensiveBlocks.flatMap((block, i) => [
    siteField('block-' + i + '-title', 'Блок ' + (i + 1) + ' · назва', block.title),
    siteField('block-' + i + '-duration', 'Блок ' + (i + 1) + ' · тривалість', block.duration),
    ...block.paragraphs.map((paragraph, j) =>
      siteField(
        'block-' + i + '-paragraph-' + j,
        'Блок ' + (i + 1) + ' · теза ' + (j + 1),
        paragraph,
        'multiline',
      ),
    ),
  ]),
]);
