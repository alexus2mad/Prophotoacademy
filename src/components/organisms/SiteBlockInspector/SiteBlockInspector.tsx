import { Plus } from 'lucide-react';
import { SiteBlockActions } from '@/components/molecules/SiteBlockActions/SiteBlockActions';
import { SiteEditorField } from '@/components/molecules/SiteEditorField/SiteEditorField';
import { isCollection, itemFieldId, maxBlockItems } from '@/lib/site-editor/blocks';
import type { SiteField } from '@/lib/site-editor/types';
import type { SiteBlockInspectorProps } from './types';
import styles from './SiteBlockInspector.module.css';

export function SiteBlockInspector(props: SiteBlockInspectorProps) {
  const { section, fieldId, disabled } = props;
  const collection = isCollection(section.blockType);
  const ids = section.itemIds ?? [];
  const selected = ids.find((id) => fieldId.startsWith(itemFieldId(id, ''))) ?? ids[0];
  const at = ids.indexOf(selected);
  const isCards = section.blockType === 'cards';
  const noun = isCards ? 'Картка' : 'Слайд';
  const itemLabel = (id: string, i: number) => {
    const key = itemFieldId(id, isCards ? 'title' : 'caption');
    const text = section.fields.find((f) => f.id === key)?.value.trim();
    return text ? `${noun} ${i + 1} · ${text.slice(0, 50)}` : `${noun} ${i + 1}`;
  };
  function fieldControl(field: SiteField) {
    return (
      <SiteEditorField
        key={field.id}
        field={field}
        disabled={disabled}
        removable={props.removableImages || !!section.blockType}
        selected={field.id === fieldId}
        onChange={(value) => props.onChange(field.id, value)}
        onStyle={(style) => props.onStyle(field.id, style)}
        onChooseImage={() => props.onChooseImage(field.id)}
      />
    );
  }
  return (
    <div className={styles.inspector}>
      {(collection ? section.fields.filter((f) => !f.id.startsWith('item-')) : section.fields).map(
        fieldControl,
      )}
      {collection && (
        <section
          className={styles.collection}
          aria-label={isCards ? 'Картки блоку' : 'Слайди каруселі'}
        >
          <div className={styles.groupTitle}>
            <h3>{isCards ? 'Картки' : 'Слайди'}</h3>
            <button
              type="button"
              disabled={disabled || ids.length >= maxBlockItems}
              onClick={props.onAddItem}
            >
              <Plus size={16} aria-hidden="true" />
              {isCards ? 'Додати картку' : 'Додати слайд'}
            </button>
          </div>
          {selected && (
            <>
              <label className={styles.picker}>
                {isCards ? 'Картка для редагування' : 'Слайд для редагування'}
                <select
                  value={selected}
                  onChange={(e) =>
                    props.onSelectField(itemFieldId(e.target.value, isCards ? 'title' : 'image'))
                  }
                >
                  {ids.map((id, i) => (
                    <option value={id} key={id}>
                      {itemLabel(id, i)}
                    </option>
                  ))}
                </select>
              </label>
              <SiteBlockActions
                label={itemLabel(selected, at)}
                disabled={disabled}
                first={at === 0}
                last={at === ids.length - 1}
                onMove={(d) => props.onMoveItem(selected, d)}
                onRemove={() => props.onRemoveItem(selected)}
              />
              <div className={styles.item} key={selected}>
                {section.fields
                  .filter((field) => field.id.startsWith(itemFieldId(selected, '')))
                  .map(fieldControl)}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
