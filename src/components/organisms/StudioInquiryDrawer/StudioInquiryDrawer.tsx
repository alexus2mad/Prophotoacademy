'use client';

import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { StudioInquiryForm } from '@/components/organisms/StudioInquiryForm/StudioInquiryForm';
import { useStudioInquiryDrawer } from './hooks';
import styles from './StudioInquiryDrawer.module.css';

export function StudioInquiryDrawer() {
  const { dialog, context, revision } = useStudioInquiryDrawer();
  return (
    <Dialog
      id="inquiry-dialog"
      dialogRef={dialog}
      className={`studio-dark ${styles.drawer}`}
      closeLabel="Закрити форму"
      closeOnBackdrop
      aria-labelledby="studio-inquiry-title"
    >
      <p className="studio-label">ProPhoto</p>
      <h2 id="studio-inquiry-title">{context.title || 'Залишити заявку'}</h2>
      <p className={styles.description}>Передзвонимо й допоможемо з вибором</p>
      <StudioInquiryForm key={revision} context={context} id="studio-drawer" compact />
    </Dialog>
  );
}
