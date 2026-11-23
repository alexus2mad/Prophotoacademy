import { useEffect, useRef, useState } from 'react';
export function useMoveBlockDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [choice, choose] = useState('');
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  return { dialog, choice, choose };
}
