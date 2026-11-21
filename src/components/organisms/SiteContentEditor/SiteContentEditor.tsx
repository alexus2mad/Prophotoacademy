'use client';
import { ArrowLeft, ArrowRight, Plus, Search } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { SiteEditorField } from '@/components/molecules/SiteEditorField/SiteEditorField';
import { SiteEditorPreview } from '@/components/molecules/SiteEditorPreview/SiteEditorPreview';
import { SitePageCreate } from '@/components/molecules/SitePageCreate/SitePageCreate';
import { useSiteContentEditor } from './hooks';
import type { SiteContentEditorProps } from './types';
import styles from './SiteContentEditor.module.css';

const kinds = { home: 'Головна', course: 'Курс', workshop: 'Воркшоп', landing: 'Лендинг' };

export function SiteContentEditor(props: SiteContentEditorProps) {
  const h = useSiteContentEditor(props);
  const { page, record } = h;
  const busy = !!h.task;
  const disabled = busy || !props.writable;
  const section = page?.sections.find((s) => s.id === h.sectionId);
  const customLanding = page?.sections.some((s) => s.id === 'landing-cover') ?? false;
  const filter = h.query.trim().toLocaleLowerCase('uk');
  const visiblePages = h.pages.filter((p) =>
    (p.title + ' ' + p.path + ' ' + kinds[p.kind]).toLocaleLowerCase('uk').includes(filter),
  );
  const status = h.dirty
    ? 'Незбережені зміни'
    : record?.hasDraft
      ? 'Збережена чернетка'
      : 'Опубліковано';

  return (
    <div className={styles.editor} data-site-editor="" aria-busy={busy}>
      {page && record ? (
        <>
          <button type="button" className={styles.back} onClick={h.library} disabled={busy}>
            <ArrowLeft size={17} aria-hidden="true" /> Сторінки сайту
          </button>
          <header className={styles.pageHeader}>
            <div>
              <h1 ref={h.heading} tabIndex={-1}>
                {page.title}
              </h1>
              <p className={styles.path}>{page.path}</p>
            </div>
            <div className={styles.actions}>
              <Button
                className="button button-secondary"
                disabled={disabled || !h.dirty || h.conflict}
                onClick={() => h.save('save')}
              >
                {h.task === 'save' ? 'Зберігаємо…' : 'Зберегти чернетку'}
              </Button>
              <Button
                disabled={disabled || h.dirty || !record.hasDraft || h.conflict}
                onClick={() => h.save('publish')}
              >
                {h.task === 'publish' ? 'Публікуємо…' : 'Опублікувати'}
              </Button>
            </div>
          </header>
          <div className={styles.feedback}>
            <p role="status" className={styles.state} data-dirty={h.dirty}>
              {h.task === 'upload' ? 'Завантажуємо зображення…' : h.message || status}
            </p>
            {h.error && (
              <p role="alert" className={styles.error}>
                {h.error}
              </p>
            )}
            {h.conflict && (
              <Button
                className="button button-secondary"
                disabled={busy}
                onClick={() => h.open(page.path)}
              >
                Відкрити актуальну версію
              </Button>
            )}
          </div>
          <div className={styles.mobileSwitch} role="group" aria-label="Режим редактора">
            <button
              type="button"
              aria-pressed={h.panel === 'fields'}
              onClick={() => h.setPanel('fields')}
            >
              Редагування
            </button>
            <button
              type="button"
              aria-pressed={h.panel === 'preview'}
              onClick={() => h.setPanel('preview')}
            >
              Перегляд
            </button>
          </div>
          <div className={styles.split} data-panel={h.panel}>
            <section className={styles.fields} aria-label="Вміст сторінки">
              <div className={styles.sectionHead}>
                <label htmlFor="site-editor-section">Розділ сторінки</label>
                <select
                  id="site-editor-section"
                  value={h.sectionId}
                  onChange={(e) => h.setSectionId(e.target.value)}
                  disabled={busy}
                >
                  {page.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              {section && (
                <div className={styles.fieldList} key={section.id}>
                  {section.fields.map((field) => (
                    <SiteEditorField
                      key={field.id}
                      field={field}
                      disabled={disabled}
                      removable={customLanding}
                      onChange={(value) => h.update(section.id, field.id, value)}
                      onUpload={(file) => h.upload(section.id, field.id, file)}
                    />
                  ))}
                </div>
              )}
              {customLanding && (
                <div className={styles.sectionActions}>
                  <button type="button" disabled={disabled} onClick={h.appendSection}>
                    Додати розділ
                  </button>
                  {h.sectionId.startsWith('landing-body-') && (
                    <button type="button" disabled={disabled} onClick={h.removeSection}>
                      Видалити розділ
                    </button>
                  )}
                </div>
              )}
            </section>
            <div className={styles.canvas}>
              <SiteEditorPreview
                page={record.page}
                sectionId={h.sectionId}
                onInspect={({ sectionId, fieldId }) => {
                  h.setSectionId(sectionId);
                  h.setPanel('fields');
                  requestAnimationFrame(() =>
                    document.getElementById('editor-field-' + fieldId)?.focus(),
                  );
                }}
                version={h.previewKey}
                dirty={h.dirty}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <header className={styles.pageHeader}>
            <h1 ref={h.heading} tabIndex={-1}>
              Сторінки сайту
            </h1>
            {!h.creating && (
              <Button disabled={disabled} onClick={() => h.setCreating(true)}>
                <Plus size={17} aria-hidden="true" /> Створити сторінку
              </Button>
            )}
          </header>
          {h.error && (
            <p className={styles.error} role="alert">
              {h.error}
            </p>
          )}
          {!props.writable && (
            <p role="status" className={styles.notice}>
              Режим перегляду. Для збереження та публікації підключіть сховище контенту
            </p>
          )}
          {h.creating ? (
            <SitePageCreate busy={busy} onCancel={h.library} onCreate={h.create} />
          ) : (
            <>
              <label className={styles.search}>
                <Search size={19} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Пошук сторінок"
                  placeholder="Знайти за назвою або адресою"
                  value={h.query}
                  onChange={(e) => h.setQuery(e.target.value)}
                />
              </label>
              {h.task === 'load' && (
                <p className={styles.notice} role="status">
                  Завантажуємо сторінку…
                </p>
              )}
              <ul className={styles.list} aria-label="Сторінки для редагування">
                {visiblePages.map((p) => (
                  <li key={p.path}>
                    <button
                      className={styles.card}
                      type="button"
                      disabled={busy}
                      onClick={() => h.open(p.path)}
                    >
                      <span className={styles.cardTop}>
                        <span>{kinds[p.kind]}</span>
                        <span className={styles.badge} data-draft={p.hasDraft || !p.published}>
                          {p.hasDraft || !p.published ? 'Чернетка' : 'Опубліковано'}
                        </span>
                      </span>
                      <strong>{p.title}</strong>
                      <span className={styles.cardBottom}>
                        <span>{p.path}</span>
                        <ArrowRight size={18} aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {visiblePages.length === 0 && (
                <p role="status">
                  {filter ? 'За цим запитом сторінок немає' : 'Поки немає сторінок'}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
