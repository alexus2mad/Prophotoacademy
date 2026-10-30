'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { catalogCategory } from '@/lib/catalog/selectors';

export function useProgramCatalog(serverAsOf: string) {
  const params = useSearchParams();
  const [asOf, setAsOf] = useState(serverAsOf);
  const [motionReady, setMotionReady] = useState(false);
  useEffect(() => {
    setAsOf(new Date().toISOString());
    setMotionReady(true);
  }, [serverAsOf]);
  return {
    category: catalogCategory(params.get('category')),
    query: params.toString(),
    motionReady,
    asOf,
  };
}
