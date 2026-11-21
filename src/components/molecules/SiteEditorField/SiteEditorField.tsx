import type { SiteEditorFieldProps } from './types';
import styles from './SiteEditorField.module.css';

export function SiteEditorField({
  field,
  disabled,
  removable,
  onChange,
  onUpload,
}: SiteEditorFieldProps) {
  const id = 'editor-field-' + field.id;
  if (field.kind === 'image')
    return (
      <div className={styles.field}>
        <label htmlFor={id}>{field.label}</label>
        {field.value && (
          <img src={field.value} alt={field.label} className={styles.image} loading="lazy" />
        )}
        <div className={styles.upload}>
          <span aria-hidden="true">
            {field.value ? 'Замінити зображення' : 'Додати зображення'}
          </span>
          <input
            id={id}
            className={styles.file}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={disabled}
            aria-describedby={id + '-formats'}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = '';
            }}
          />
        </div>
        <small id={id + '-formats'}>JPG, PNG, WebP або AVIF · до 10 МБ</small>
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
    <div className={styles.field}>
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
    </div>
  );
}
