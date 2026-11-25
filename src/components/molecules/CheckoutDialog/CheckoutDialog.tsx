'use client';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { useCheckoutDialog } from './hooks';
import type { CheckoutDialogProps } from './types';
import styles from './CheckoutDialog.module.css';

export function CheckoutDialog({ children, ...navigation }: CheckoutDialogProps) {
  const { dialog, dismiss, visible } = useCheckoutDialog(navigation);
  if (!visible) return null;
  return (
    <Dialog
      dialogRef={dialog}
      className={styles.modal}
      closeLabel="Закрити оформлення"
      aria-labelledby="checkout-title"
      onDismiss={dismiss}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className={styles.content}>{children}</div>
    </Dialog>
  );
}
