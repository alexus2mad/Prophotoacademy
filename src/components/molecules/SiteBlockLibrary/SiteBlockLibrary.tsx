import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { SitePatternPreview } from '@/components/atoms/SitePatternPreview/SitePatternPreview';
import { blockLibrary } from '@/lib/site-editor/blocks';
import { intensiveLibrary } from '@/lib/site-editor/intensive';
import { useBlockLibraryDialog } from './hooks';
import type { SiteBlockLibraryProps } from './types';
import styles from './SiteBlockLibrary.module.css';

const categories = [
  {
    label: 'Основні блоки',
    entries: blockLibrary.filter((entry) => !entry.type.startsWith('intensive-')),
  },
  { label: 'Для інтенсиву', entries: intensiveLibrary },
];

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
      {categories.map(({ label, entries }) => (
        <section key={label} aria-label={label}>
          <h3>{label}</h3>
          <div className={styles.catalog}>
            {entries.map((entry) => (
              <button type="button" key={entry.type} onClick={() => onChoose(entry.type)}>
                <SitePatternPreview pattern={entry.type} />
                <strong>{entry.label}</strong>
                <span className={styles.description}>{entry.description}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </Dialog>
  );
}
