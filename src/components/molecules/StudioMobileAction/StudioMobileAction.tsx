import type { StudioMobileActionProps } from './types';
import styles from './StudioMobileAction.module.css';

export function StudioMobileAction({ children, spacing = 'compact' }: StudioMobileActionProps) {
  return (
    <div className={styles.bar} data-studio-mobile-action={spacing}>
      {children}
    </div>
  );
}
