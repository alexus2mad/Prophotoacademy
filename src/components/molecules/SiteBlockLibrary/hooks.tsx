import { useEffect } from 'react';
import { useDialog } from '@/components/molecules/Dialog/hooks';

export function useBlockLibraryDialog() {
  const { dialog } = useDialog();
  useEffect(() => {
    dialog.current?.showModal();
  }, [dialog]);
  return dialog;
}
