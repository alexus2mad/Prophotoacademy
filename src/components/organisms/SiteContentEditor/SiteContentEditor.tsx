'use client';
import { ArrowLeft, Plus, RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { SiteBlockActions } from '@/components/molecules/SiteBlockActions/SiteBlockActions';
import { SiteBlockLibrary } from '@/components/molecules/SiteBlockLibrary/SiteBlockLibrary';
import { SiteImageLibrary } from '@/components/molecules/SiteImageLibrary/SiteImageLibrary';
import { SiteBlockInspector } from '@/components/organisms/SiteBlockInspector/SiteBlockInspector';
import { blockOutlineLabel, placementLabel } from '@/lib/site-editor/block-label';
import { blocksAtPlacement, pagePlacements } from '@/lib/site-editor/placements';
import { SiteEditorPreview } from '@/components/molecules/SiteEditorPreview/SiteEditorPreview';
import { SitePageCreate } from '@/components/molecules/SitePageCreate/SitePageCreate';
import { SiteContentSync } from '@/components/organisms/SiteContentSync/SiteContentSync';
import { SitePageBrowser } from '@/components/organisms/SitePageBrowser/SitePageBrowser';
import { environmentLabels } from '@/lib/site-editor/environments';
import { ticketPriceSummary } from '@/lib/site-editor/workshop-ticket/summary';
import {
  productionEditorHref,
  productionEditorRoot,
  productionSyncHref,
} from '@/lib/site-editor/sync/links';
import { useSiteContentEditor } from './hooks';
import type { SiteContentEditorProps } from './types';
import styles from './SiteContentEditor.module.css';

export function SiteContentEditor(props: SiteContentEditorProps) {
  const h = useSiteContentEditor(props);
  const { page, record } = h;
  const tickets = (props.tickets ?? []).filter((option) => option.path === page?.path);
  const ticket = tickets.find((option) => option.id === page?.offerId)?.presentation;
  const busy = !!h.task;
  const disabled = busy || !props.writable || h.conflict;
  const section = page?.sections.find((s) => s.id === h.sectionId);
  const nativeSections = page?.sections.filter((s) => !s.blockType) ?? [];
  const groups = page
    ? pagePlacements(page)
        .map((slot) => ({ ...slot, blocks: blocksAtPlacement(page, slot.id) }))
        .filter((group) => group.blocks.length)
    : [];
  const currentImage = page?.sections
    .find((s) => s.id === h.imageTarget?.sectionId)
    ?.fields.find((f) => f.id === h.imageTarget?.fieldId);
  const customLanding = page?.sections.some((s) => s.id === 'landing-cover') ?? false;
  const both = h.environments.length > 1;
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
              <p className={styles.path}>
                {both && (
                  <span className={styles.envBadge} data-env={h.target}>
                    {environmentLabels[h.target]}
                  </span>
                )}
                {page.path}
              </p>
            </div>
            <div className={styles.actions}>
              <Button
                className="button button-secondary"
                disabled={disabled}
                onClick={() => h.blocks.openLibrary()}
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
                {h.task === 'publish'
                  ? 'Публікуємо…'
                  : both
                    ? 'Опублікувати на ' + environmentLabels[h.target]
                    : 'Опублікувати'}
              </Button>
              {props.sync === 'staging' &&
                (h.dirty || record.hasDraft || !record.published ? (
                  <Button
                    className="button button-secondary"
                    disabled
                    aria-describedby="site-production-handoff"
                  >
                    <Send size={17} aria-hidden="true" /> Опублікувати на проді
                  </Button>
                ) : (
                  <a
                    className={'button button-secondary ' + styles.handoff}
                    href={productionSyncHref(page.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-describedby="site-production-handoff"
                  >
                    <Send size={17} aria-hidden="true" /> Опублікувати на проді
                  </a>
                ))}
            </div>
          </header>
          {props.sync === 'staging' && (
            <p className={styles.mainAdmin}>
              Цю сторінку можна редагувати й в основній адмінці на продакшні.{' '}
              <a href={productionEditorHref(page.path, 'staging')}>Відкрити там</a>
            </p>
          )}
          {props.sync === 'staging' && (
            <p id="site-production-handoff" className={styles.handoffHint}>
              {h.dirty || record.hasDraft || !record.published
                ? 'Спочатку опублікуйте зміни на staging: на прод переноситься опублікована версія'
                : 'Відкриє редактор продакшну в новій вкладці для перевірки й підтвердження'}
            </p>
          )}
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
                  {groups.map((group) => (
                    <optgroup key={group.id} label={placementLabel(group.id, group.label)}>
                      {group.blocks.map((s, i) => (
                        <option key={s.id} value={s.id}>
                          {i + 1}. {blockOutlineLabel(s)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {section?.blockType && (
                  <SiteBlockActions
                    label={section.label}
                    disabled={disabled}
                    first={h.blocks.first}
                    last={h.blocks.last}
                    onMove={h.blocks.moveBlock}
                    onDuplicate={h.blocks.copyBlock}
                    onRemove={h.blocks.deleteBlock}
                  />
                )}
              </div>
              {section?.id === 'landing-cover' &&
                page.template === 'workshop-intensive' &&
                tickets.length > 0 && (
                  <div className={styles.sectionHead}>
                    <label htmlFor="site-workshop-ticket">Квиток для оплати</label>
                    <select
                      id="site-workshop-ticket"
                      value={page.offerId ?? ''}
                      disabled={disabled}
                      onChange={(event) => h.selectOffer(event.target.value)}
                    >
                      <option value="">Без продажу квитків</option>
                      {tickets.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label} · {ticketPriceSummary(item.presentation)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              {section && (
                <SiteBlockInspector
                  key={section.id}
                  ticket={ticket}
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
                ticket={ticket}
                savedPage={record.page}
                editable={!disabled}
                sectionId={h.sectionId}
                onSelect={({ sectionId, fieldId }) => h.selectField(sectionId, fieldId)}
                onChange={({ sectionId, fieldId }, value) => h.update(sectionId, fieldId, value)}
                onReplaceImage={h.chooseImage}
                onInsertAt={h.blocks.openLibrary}
                onMoveTo={h.blocks.moveTo}
                focusNewBlock={h.blocks.focusNewBlock}
                version={h.previewKey}
                target={h.target}
              />
            </div>
          </div>
          {!disabled && h.blocks.insertion && (
            <SiteBlockLibrary
              locationLabel={h.blocks.insertion.label}
              onChoose={h.blocks.addBlock}
              onClose={h.blocks.closeLibrary}
            />
          )}
          {h.imageTarget?.path === page.path && currentImage?.kind === 'image' && (
            <SiteImageLibrary
              current={currentImage.value}
              target={h.target}
              onChoose={h.applyImage}
              onClose={() => h.setImageTarget(null)}
            />
          )}
        </>
      ) : props.sync === 'production' && h.syncTarget !== null ? (
        <SiteContentSync
          focusPath={h.syncTarget || undefined}
          onClose={h.closeSync}
          onPublished={h.syncPublished}
        />
      ) : (
        <>
          <header className={styles.pageHeader}>
            <h1 ref={h.heading} tabIndex={-1}>
              Сторінки сайту
            </h1>
            {!h.creating && (
              <div className={styles.actions}>
                {props.sync === 'production' && (
                  <Button
                    className="button button-secondary"
                    disabled={disabled}
                    onClick={() => h.openSync()}
                  >
                    <RefreshCw size={17} aria-hidden="true" /> Зміни зі staging
                  </Button>
                )}
                <Button disabled={disabled} onClick={() => h.setCreating(true)}>
                  <Plus size={17} aria-hidden="true" /> Створити сторінку
                </Button>
              </div>
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
          {props.sync === 'staging' && (
            <p className={styles.mainAdmin}>
              Основна адмінка сторінок — на продакшні, там можна керувати і staging, і сайтом. Цей
              редактор залишено для шаблонів, яких ще немає на продакшні.{' '}
              <a href={productionEditorRoot}>Відкрити основну адмінку</a>
            </p>
          )}
          {h.creating ? (
            <>
              {both && (
                <p role="status" className={styles.notice}>
                  Сторінку буде створено на {environmentLabels[h.target]}
                </p>
              )}
              <SitePageCreate busy={busy} onCancel={h.library} onCreate={h.create} />
            </>
          ) : (
            <>
              {h.task === 'load' && (
                <p className={styles.notice} role="status">
                  Завантажуємо сторінку…
                </p>
              )}
              {h.browserPages.length ? (
                <SitePageBrowser
                  pages={h.browserPages}
                  environments={h.environments}
                  target={h.target}
                  onTarget={h.setTarget}
                  initialPath={h.lastPath}
                  disabled={busy}
                  onOpen={h.open}
                  onPublishToProduction={
                    props.sync === 'production' ? (path) => h.openSync(path) : undefined
                  }
                />
              ) : (
                <p role="status">Поки немає сторінок</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
