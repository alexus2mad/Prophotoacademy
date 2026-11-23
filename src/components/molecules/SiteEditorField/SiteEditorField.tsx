import { Images } from 'lucide-react';
import { isStylableField } from '@/lib/site-editor/blocks';
import { SiteTextFormatting } from '@/components/molecules/SiteTextFormatting/SiteTextFormatting';
import type { SiteEditorFieldProps } from './types';
import styles from './SiteEditorField.module.css';

export function SiteEditorField({
  field,
  disabled,
  removable,
  selected,
  onChange,
  onChooseImage,
  onStyle,
}: SiteEditorFieldProps) {
  const id = 'editor-field-' + field.id;
  if (field.kind === 'image')
    return (
      <div className={styles.field} data-selected={selected || undefined}>
        <span id={id + '-label'} className={styles.label}>
          {field.label}
        </span>
        <button
          type="button"
          id={id}
          className={styles.imageChoice}
          disabled={disabled}
          aria-label={`${field.value ? 'Замінити зображення' : 'Обрати зображення'} · ${field.label}`}
          onClick={onChooseImage}
        >
          {field.value && (
            <img src={field.value} alt={field.label} className={styles.image} loading="lazy" />
          )}
          <span>
            <Images size={16} aria-hidden="true" />
            {field.value ? 'Замінити зображення' : 'Обрати зображення'}
          </span>
        </button>
        {removable && field.value && (
          <button
            className={styles.remove}
            type="button"
            disabled={disabled}
            onClick={() => onChange('')}
          >
            Прибрати зображення
          </button>
        )}
      </div>
    );
  return (
    <div className={styles.field} data-selected={selected || undefined}>
      <label htmlFor={id}>{field.label}</label>
      {field.kind === 'multiline' ? (
        <textarea
          id={id}
          rows={5}
          value={field.value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={field.value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {isStylableField(field) && (
        <SiteTextFormatting
          fieldLabel={field.label}
          style={field.style}
          disabled={disabled}
          onChange={onStyle}
        />
      )}
    </div>
  );
}
