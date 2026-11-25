import { IconButton } from '@/components/atoms/IconButton/IconButton';
import { X } from 'lucide-react';
import type { DialogProps } from './types';

export function Dialog({
  dialogRef,
  children,
  className = '',
  closeLabel,
  closeOnBackdrop = false,
  closeIconSize,
  onDismiss,
  onClick,
  ...props
}: DialogProps) {
  function dismiss() {
    if (onDismiss) onDismiss();
    else dialogRef.current?.close();
  }

  return (
    <dialog
      {...props}
      ref={dialogRef}
      className={`dialog ${className}`.trim()}
      onClick={(event) => {
        onClick?.(event);
        if (closeOnBackdrop && event.target === event.currentTarget) dismiss();
      }}
    >
      <IconButton className="dialog-close" aria-label={closeLabel} onClick={dismiss}>
        <X size={closeIconSize} />
      </IconButton>
      {children}
    </dialog>
  );
}
