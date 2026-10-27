'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isHubHost } from '@/lib/ecosystem';

export function useStatusSite() {
  const pathname = usePathname();
  const [hubHost, setHubHost] = useState(false);

  useEffect(() => {
    // Hub's public host rewrites routes without exposing the /hub prefix.
    setHubHost(isHubHost(window.location.host));
  }, []);

  return hubHost || pathname === '/hub' || pathname.startsWith('/hub/') ? 'hub' : 'academy';
}
