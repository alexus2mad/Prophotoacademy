import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import type { SiteBlockActionsProps } from './types';
import styles from './SiteBlockActions.module.css';

export function SiteBlockActions({
  label,
  disabled,
  first,
  last,
  onMove,
  onDuplicate,
  onRemove,
}: SiteBlockActionsProps) {
  return (
    <div className={styles.tools} role="group" aria-label={`Дії · ${label}`}>
      <button
        type="button"
        aria-label={`Перемістити вище · ${label}`}
        title="Перемістити вище"
        disabled={disabled || first}
        onClick={() => onMove(-1)}
      >
        <ChevronUp aria-hidden="true" size={18} />
      </button>
      <button
        type="button"
        aria-label={`Перемістити нижче · ${label}`}
        title="Перемістити нижче"
        disabled={disabled || last}
        onClick={() => onMove(1)}
      >
        <ChevronDown aria-hidden="true" size={18} />
      </button>
      {onDuplicate && (
        <button
          type="button"
          aria-label={`Дублювати · ${label}`}
          title="Дублювати блок"
          disabled={disabled}
          onClick={onDuplicate}
        >
          <Copy aria-hidden="true" size={16} />
        </button>
      )}
      <button
        className={styles.remove}
        type="button"
        aria-label={`Видалити · ${label}`}
        title="Видалити"
        disabled={disabled}
        onClick={onRemove}
      >
        <Trash2 aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
