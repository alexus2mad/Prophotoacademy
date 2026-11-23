import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { SitePatternPreview } from '@/components/atoms/SitePatternPreview/SitePatternPreview';
import { blockLibrary } from '@/lib/site-editor/blocks';
import { useBlockLibraryDialog } from './hooks';
import type { SiteBlockLibraryProps } from './types';
import styles from './SiteBlockLibrary.module.css';

export function SiteBlockLibrary({ locationLabel, onChoose, onClose }: SiteBlockLibraryProps) {
  const dialog = useBlockLibraryDialog();
  return (
    <Dialog
      dialogRef={dialog}
      className={styles.library}
      closeLabel="Закрити бібліотеку блоків"
      closeOnBackdrop
      onClose={onClose}
      aria-labelledby="block-library-title"
      aria-describedby="block-library-position"
    >
      <h2 id="block-library-title">Додати блок</h2>
      <p id="block-library-position">{locationLabel}</p>
      <div className={styles.catalog}>
        {blockLibrary.map((entry) => (
          <button type="button" key={entry.type} onClick={() => onChoose(entry.type)}>
            <SitePatternPreview pattern={entry.type} />
            <strong>{entry.label}</strong>
            <span className={styles.description}>{entry.description}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
