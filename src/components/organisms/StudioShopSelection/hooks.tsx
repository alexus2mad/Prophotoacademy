'use client';
import { useState } from 'react';

export function useStudioShopSelection() {
  const [selection, setSelection] = useState<string[]>([]);
  const toggle = (item: string) =>
    setSelection((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  const topic = selection.length ? `Підбір техніки: ${selection.join(', ')}` : 'Підбір техніки';
  return { selection, toggle, topic };
}
