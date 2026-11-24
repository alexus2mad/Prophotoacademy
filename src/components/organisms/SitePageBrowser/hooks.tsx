'use client';
import { useRef, useState } from 'react';
import { needsAttention } from '@/lib/site-editor/environments';
import { groupPages } from '@/lib/site-editor/page-groups';
import type { BrowserView, SitePageBrowserProps } from './types';

const kinds = { home: 'Головна', course: 'Курс', workshop: 'Воркшоп', landing: 'Лендинг' };

export function useSitePageBrowser({ pages, initialPath }: SitePageBrowserProps) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<BrowserView>('list');
  const [selected, setSelected] = useState(
    () =>
      pages.find((p) => p.path === initialPath)?.path ??
      pages.find(needsAttention)?.path ??
      pages[0]?.path,
  );
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const filter = query.trim().toLocaleLowerCase('uk');
  const visible = pages.filter((p) =>
    (p.title + ' ' + p.path + ' ' + kinds[p.kind]).toLocaleLowerCase('uk').includes(filter),
  );
  const page = pages.find((p) => p.path === selected);

  function select(path: string) {
    setSelected(path);
    setView('detail');
    requestAnimationFrame(() => detailHeading.current?.focus());
  }

  return {
    query,
    setQuery,
    groups: groupPages(visible),
    total: visible.length,
    page,
    select,
    view,
    back: () => setView('list'),
    detailHeading,
    kindLabel: (kind: keyof typeof kinds) => kinds[kind],
  };
}
