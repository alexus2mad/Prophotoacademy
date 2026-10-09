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
  onClick,
  ...props
}: DialogProps) {
  return (
    <dialog
      {...props}
      ref={dialogRef}
      className={`dialog ${className}`.trim()}
      onClick={(event) => {
        onClick?.(event);
        if (closeOnBackdrop && event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <IconButton
        className="dialog-close"
        aria-label={closeLabel}
        onClick={() => dialogRef.current?.close()}
      >
        <X size={closeIconSize} />
      </IconButton>
      {children}
    </dialog>
  );
}
