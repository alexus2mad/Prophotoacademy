import { materialNames } from '@/lib/learning/editor';
import type { LearningBlock } from '@/lib/learning/types';
import type { MaterialPickerProps } from './types';

export function MaterialPicker({ onAdd }: MaterialPickerProps) {
  return (
    <details className="authoring-add-material">
      <summary className="button button-secondary">+ Додати матеріал</summary>
      <div className="authoring-material-options">
        {(Object.keys(materialNames) as LearningBlock['kind'][]).map((kind) => (
          <button
            type="button"
            key={kind}
            onClick={(event) => {
              onAdd(kind);
              event.currentTarget.closest('details')?.removeAttribute('open');
            }}
          >
            {materialNames[kind]}
          </button>
        ))}
      </div>
    </details>
  );
}
