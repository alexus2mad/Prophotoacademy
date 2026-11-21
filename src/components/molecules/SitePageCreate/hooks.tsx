'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SitePage } from '@/lib/site-editor/types';
import type { SitePageCreateProps } from './types';

const letters: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ie',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'iu',
  я: 'ia',
};
function slugFromTitle(title: string) {
  return Array.from(title.toLocaleLowerCase('uk'), (character) => letters[character] ?? character)
    .join('')
    .replace(/['’ʼ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 80)
    .replace(/^-|-$/g, '');
}
export function useSitePageCreate(onCreate: SitePageCreateProps['onCreate']) {
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState<string | null>(null);
  const [kind, setKind] = useState<SitePage['kind']>('landing');
  const slug = customSlug ?? slugFromTitle(title);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim() && slug) onCreate({ title: title.trim(), path: '/' + slug, kind });
  }
  return { title, setTitle, slug, setCustomSlug, kind, setKind, submit };
}
