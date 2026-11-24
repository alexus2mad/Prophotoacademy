import { Plus } from 'lucide-react';
import { ticketPriceSummary } from '@/lib/site-editor/workshop-ticket/summary';
import { SiteBlockActions } from '@/components/molecules/SiteBlockActions/SiteBlockActions';
import { SiteEditorField } from '@/components/molecules/SiteEditorField/SiteEditorField';
import { itemFieldId, maxBlockItems } from '@/lib/site-editor/blocks';
import { collectionControls } from './collections';
import type { SiteField } from '@/lib/site-editor/types';
import type { SiteBlockInspectorProps } from './types';
import styles from './SiteBlockInspector.module.css';

export function SiteBlockInspector(props: SiteBlockInspectorProps) {
  const { section, fieldId, disabled } = props;
  const ticket =
    section.blockType === 'intensive-intro' || section.blockType === 'intensive-offer'
      ? props.ticket
      : undefined;
  const collection = collectionControls(section.blockType);
  const ids = section.itemIds ?? [];
  const selected = ids.find((id) => fieldId.startsWith(itemFieldId(id, ''))) ?? ids[0];
  const at = ids.indexOf(selected);
  const itemLabel = (id: string, i: number) => {
    if (!collection) return '';
    const noun = collection.noun;
    const key = itemFieldId(id, collection.label);
    const text = section.fields.find((f) => f.id === key)?.value.trim();
    return text ? `${noun} ${i + 1} · ${text.slice(0, 50)}` : `${noun} ${i + 1}`;
  };
  function fieldControl(field: SiteField) {
    if (ticket && field.id === 'currency') return null;
    if (ticket && field.id === 'price')
      return (
        <dl key={field.id} className={styles.ticketPrice}>
          <dt>{ticket.options.length > 1 ? 'Ціни з обраних квитків' : 'Ціна з обраного квитка'}</dt>
          <dd>{ticketPriceSummary(ticket)}</dd>
        </dl>
      );
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
        <section className={styles.collection} aria-label={collection.region}>
          <div className={styles.groupTitle}>
            <h3>{collection.group}</h3>
            <button
              type="button"
              disabled={disabled || ids.length >= maxBlockItems}
              onClick={props.onAddItem}
            >
              <Plus size={16} aria-hidden="true" />
              Додати {collection.object}
            </button>
          </div>
          {selected && (
            <>
              <label className={styles.picker}>
                {collection.noun} для редагування
                <select
                  value={selected}
                  onChange={(e) =>
                    props.onSelectField(itemFieldId(e.target.value, collection.target))
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
