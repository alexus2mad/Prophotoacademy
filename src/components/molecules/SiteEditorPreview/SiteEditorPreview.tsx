import { createPortal } from 'react-dom';
import { SitePreviewSlot } from '@/components/molecules/SitePreviewSlot/SitePreviewSlot';
import { SiteMoveBlockDialog } from '@/components/molecules/SiteMoveBlockDialog/SiteMoveBlockDialog';
import { blocksAtPlacement } from '@/lib/site-editor/placements';
import { previewHref } from '@/lib/site-editor/environments';
import { Monitor, Smartphone } from 'lucide-react';
import { useSiteEditorPreview } from './hooks';
import type { SiteEditorPreviewProps } from './types';
import styles from './SiteEditorPreview.module.css';

export function SiteEditorPreview(props: SiteEditorPreviewProps) {
  const {
    page: { path, title },
    version,
    editable,
  } = props;
  const h = useSiteEditorPreview(props);
  const movingBlock = editable && props.page.sections.find((s) => s.id === h.moving && s.blockType);
  return (
    <section className={styles.preview} aria-label="Попередній перегляд сторінки">
      <div className={styles.bar}>
        <h2>Попередній перегляд</h2>
        <div className={styles.devices} role="group" aria-label="Ширина перегляду">
          <button
            type="button"
            onClick={() => h.setWidth(1280)}
            aria-label="Комп’ютер"
            aria-pressed={h.width === 1280}
            title="Комп’ютер"
          >
            <Monitor size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => h.setWidth(390)}
            aria-label="Телефон"
            aria-pressed={h.width === 390}
            title="Телефон"
          >
            <Smartphone size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className={styles.hint}>
        {editable
          ? 'Натисніть на текст, щоб його змінити, або на фото, щоб замінити зображення'
          : 'Перегляд сторінки'}
      </p>
      {h.hosts.map((host) =>
        createPortal(
          <SitePreviewSlot
            ticket={props.ticket}
            slot={host.slot}
            label={host.label}
            blocks={blocksAtPlacement(props.page, host.slot)}
            editable={editable}
            selected={props.sectionId}
            onInsert={props.onInsertAt}
            onChooseMove={h.setMoving}
          />,
          host.element,
          host.slot,
        ),
      )}
      {movingBlock && (
        <SiteMoveBlockDialog
          page={props.page}
          block={movingBlock}
          onClose={h.finishMove}
          onMove={(position) => {
            props.onMoveTo(movingBlock.id, position);
            h.finishMove();
          }}
        />
      )}
      <div ref={h.stage} className={styles.stage}>
        <iframe
          ref={h.frame}
          key={path + ':' + version}
          title={'Попередній перегляд: ' + title}
          src={previewHref(path, props.target ?? 'production', 'draft')}
          sandbox="allow-same-origin"
          onLoad={h.guardFrame}
          style={{
            width: h.width,
            height: h.frameHeight,
            transform: 'translateX(-50%) scale(' + h.scale + ')',
          }}
        />
      </div>
    </section>
  );
}
