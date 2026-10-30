'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { catalogCategory } from '@/lib/catalog/selectors';

export function useProgramCatalog() {
  const params = useSearchParams();
  const [motionReady, setMotionReady] = useState(false);
  useEffect(() => setMotionReady(true), []);
  return {
    category: catalogCategory(params.get('category')),
    query: params.toString(),
    motionReady,
  };
}
