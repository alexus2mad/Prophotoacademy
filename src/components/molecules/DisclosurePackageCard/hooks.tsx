import { useRef } from 'react';
import type { MouseEvent } from 'react';
export function usePackageDisclosure() {
  const details = useRef<HTMLDetailsElement>(null);
  function toggleFromCard(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (!(target instanceof Element) || !details.current || event.defaultPrevented) return;
    if (target.closest('summary,a,button,label,input,select,textarea,[contenteditable=true]'))
      return;
    const selection = event.currentTarget.ownerDocument.getSelection();
    if (selection && !selection.isCollapsed) return;
    details.current.open = !details.current.open;
  }
  return { details, toggleFromCard };
}
