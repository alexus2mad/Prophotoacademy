import { isCollection } from '@/lib/site-editor/blocks';
import type { BlockType } from '@/lib/site-editor/types';

const collections = {
  cards: {
    group: 'Картки',
    region: 'Картки блоку',
    noun: 'Картка',
    object: 'картку',
    target: 'title',
    label: 'title',
  },
  carousel: {
    group: 'Слайди',
    region: 'Слайди каруселі',
    noun: 'Слайд',
    object: 'слайд',
    target: 'image',
    label: 'caption',
  },
  'intensive-program': {
    group: 'Теми',
    region: 'Теми програми',
    noun: 'Тема',
    object: 'тему',
    target: 'title',
    label: 'title',
  },
  'intensive-gallery': {
    group: 'Фотографії',
    region: 'Фотографії галереї',
    noun: 'Фотографія',
    object: 'фотографію',
    target: 'image',
    label: 'alt',
  },
  'intensive-format': {
    group: 'Особливості',
    region: 'Особливості заняття',
    noun: 'Особливість',
    object: 'особливість',
    target: 'title',
    label: 'title',
  },
} as const;

export function collectionControls(type?: BlockType) {
  return isCollection(type) ? collections[type] : undefined;
}
