'use client';
import { ArrowLeft, ArrowRight, Plus, Search } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { SiteBlockActions } from '@/components/molecules/SiteBlockActions/SiteBlockActions';
import { SiteBlockLibrary } from '@/components/molecules/SiteBlockLibrary/SiteBlockLibrary';
import { SiteImageLibrary } from '@/components/molecules/SiteImageLibrary/SiteImageLibrary';
import { SiteBlockInspector } from '@/components/organisms/SiteBlockInspector/SiteBlockInspector';
import type { SiteSection } from '@/lib/site-editor/types';
import { SiteEditorPreview } from '@/components/molecules/SiteEditorPreview/SiteEditorPreview';
import { SitePageCreate } from '@/components/molecules/SitePageCreate/SitePageCreate';
import { useSiteContentEditor } from './hooks';
import type { SiteContentEditorProps } from './types';
import styles from './SiteContentEditor.module.css';

const kinds = { home: 'Головна', course: 'Курс', workshop: 'Воркшоп', landing: 'Лендинг' };

function outlineLabel(section: SiteSection) {
  const text = section.fields.find(
    (field) => ['text', 'heading', 'caption'].includes(field.id) && field.value.trim(),
  )?.value;
  return section.blockType && text ? section.label + ' · ' + text.slice(0, 48) : section.label;
}

export function SiteContentEditor(props: SiteContentEditorProps) {
  const h = useSiteContentEditor(props);
  const { page, record } = h;
  const busy = !!h.task;
  const disabled = busy || !props.writable || h.conflict;
  const section = page?.sections.find((s) => s.id === h.sectionId);
  const nativeSections = page?.sections.filter((s) => !s.blockType) ?? [];
  const authored = page?.sections.filter((s) => s.blockType) ?? [];
  const blockIndex = authored.findIndex((s) => s.id === h.sectionId);
  const currentImage = page?.sections
    .find((s) => s.id === h.imageTarget?.sectionId)
    ?.fields.find((f) => f.id === h.imageTarget?.fieldId);
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
                disabled={disabled}
                onClick={() => h.blocks.setLibraryOpen(true)}
              >
                <Plus size={17} aria-hidden="true" /> Додати блок
              </Button>
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
              {h.message && h.dirty ? h.message + ' · ' + status : h.message || status}
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
              aria-pressed={h.panel === 'preview'}
              onClick={() => h.setPanel('preview')}
            >
              Сторінка
            </button>
            <button
              type="button"
              aria-pressed={h.panel === 'fields'}
              onClick={() => h.setPanel('fields')}
            >
              Структура й поля
            </button>
          </div>
          <div className={styles.split} data-panel={h.panel}>
            <section className={styles.fields} aria-label="Вміст сторінки">
              <div className={styles.sectionHead}>
                <label htmlFor="site-editor-section">Структура сторінки</label>
                <select
                  id="site-editor-section"
                  value={h.sectionId}
                  onChange={(e) => h.selectField(e.target.value)}
                  disabled={busy}
                >
                  <optgroup label="Основний вміст">
                    {nativeSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  {authored.length > 0 && (
                    <optgroup label="Додані блоки">
                      {authored.map((s, i) => (
                        <option key={s.id} value={s.id}>
                          {i + 1}. {outlineLabel(s)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {section?.blockType && (
                  <SiteBlockActions
                    label={section.label}
                    disabled={disabled}
                    first={blockIndex === 0}
                    last={blockIndex === authored.length - 1}
                    onMove={h.blocks.moveBlock}
                    onDuplicate={h.blocks.copyBlock}
                    onRemove={h.blocks.deleteBlock}
                  />
                )}
              </div>
              {section && (
                <SiteBlockInspector
                  key={section.id}
                  section={section}
                  fieldId={h.fieldId}
                  disabled={disabled}
                  removableImages={customLanding || !!section.blockType}
                  onSelectField={h.setFieldId}
                  onChange={(id, value) => h.update(section.id, id, value)}
                  onStyle={(id, style) => h.updateStyle(section.id, id, style)}
                  onChooseImage={(id) => h.chooseImage({ sectionId: section.id, fieldId: id })}
                  onAddItem={h.blocks.addItem}
                  onRemoveItem={h.blocks.deleteItem}
                  onMoveItem={h.blocks.moveItem}
                />
              )}
              {customLanding && section?.id.startsWith('landing-body-') && (
                <div className={styles.sectionActions}>
                  <button type="button" disabled={disabled} onClick={h.blocks.deleteBlock}>
                    Видалити розділ
                  </button>
                </div>
              )}
            </section>
            <div className={styles.canvas}>
              <SiteEditorPreview
                page={page}
                savedPage={record.page}
                editable={!disabled}
                sectionId={h.sectionId}
                onSelect={({ sectionId, fieldId }) => h.selectField(sectionId, fieldId)}
                onChange={({ sectionId, fieldId }, value) => h.update(sectionId, fieldId, value)}
                onReplaceImage={h.chooseImage}
                version={h.previewKey}
              />
            </div>
          </div>
          {h.blocks.libraryOpen && (
            <SiteBlockLibrary
              afterLabel={section?.blockType ? outlineLabel(section) : undefined}
              onChoose={h.blocks.addBlock}
              onClose={() => h.blocks.setLibraryOpen(false)}
            />
          )}
          {h.imageTarget?.path === page.path && currentImage?.kind === 'image' && (
            <SiteImageLibrary
              current={currentImage.value}
              onChoose={h.applyImage}
              onClose={() => h.setImageTarget(null)}
            />
          )}
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
