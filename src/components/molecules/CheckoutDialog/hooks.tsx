'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import type { CheckoutDialogProps } from './types';

export function useCheckoutDialog({
  closeHref,
  intercepted,
}: Pick<CheckoutDialogProps, 'closeHref' | 'intercepted'>) {
  const { dialog } = useDialog();
  const router = useRouter();
  const visible = usePathname() === '/checkout';

  useEffect(() => {
    if (!visible) return;
    const element = dialog.current;
    const frame = requestAnimationFrame(() => {
      if (element?.isConnected && !element.open) element.showModal();
    });
    return () => {
      cancelAnimationFrame(frame);
      element?.close();
    };
  }, [dialog, visible]);

  useEffect(() => {
    if (!visible || !intercepted) return;
    function restoreFragment(event: PopStateEvent) {
      // Native anchors can add a history entry without Next's router state.
      if (event.state || window.location.pathname === '/checkout') return;
      dialog.current?.close();
      window.location.reload();
    }
    window.addEventListener('popstate', restoreFragment);
    return () => window.removeEventListener('popstate', restoreFragment);
  }, [dialog, intercepted, visible]);

  function dismiss() {
    dialog.current?.close();
    if (intercepted) router.back();
    else router.replace(closeHref);
  }

  return { dialog, dismiss, visible };
}
