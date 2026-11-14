import type { StudioCreatorHeadingProps } from './types';
import styles from './StudioCreatorHeading.module.css';

export function StudioCreatorHeading({ id, label, children }: StudioCreatorHeadingProps) {
  return (
    <header className={styles.heading}>
      {label && <p className="studio-label studio-eyebrow">{label}</p>}
      <h2 className="studio-title" id={id}>
        {children}
      </h2>
    </header>
  );
}
