import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { Button } from '@/components/atoms/Button/Button';
import { blocksAtPlacement, pagePlacements } from '@/lib/site-editor/placements';
import { getBlockSlot } from '@/lib/site-editor/block-position';
import { blockOutlineLabel, placementLabel } from '@/lib/site-editor/block-label';
import { useMoveBlockDialog } from './hooks';
import type { SiteMoveBlockDialogProps } from './types';
import styles from './SiteMoveBlockDialog.module.css';

export function SiteMoveBlockDialog({ page, block, onMove, onClose }: SiteMoveBlockDialogProps) {
  const { dialog, choice, choose } = useMoveBlockDialog();
  const options = pagePlacements(page).map((slot) => {
    const siblings = blocksAtPlacement(page, slot.id);
    const next = siblings[siblings.findIndex((s) => s.id === block.id) + 1]?.id;
    const other = siblings.filter((s) => s.id !== block.id);
    return {
      slot,
      positions: [
        ...other.map((s) => ({
          beforeBlockId: s.id,
          label: 'Перед блоком «' + blockOutlineLabel(s) + '»',
        })),
        {
          beforeBlockId: undefined,
          label: other.length ? 'Після останнього блоку' : '',
        },
      ].map((position, i) => ({
        ...position,
        key: slot.id + '/' + i,
        disabled: slot.id === getBlockSlot(block) && position.beforeBlockId === next,
        slot: slot.id,
      })),
    };
  });
  const destination = options.flatMap((o) => o.positions).find((o) => o.key === choice);
  return (
    <Dialog
      dialogRef={dialog}
      className={styles.dialog}
      closeOnBackdrop
      onClose={onClose}
      aria-labelledby="move-block-title"
      closeLabel="Закрити вибір позиції"
    >
      <h2 id="move-block-title">Перемістити блок</h2>
      <p>{blockOutlineLabel(block)}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (destination && !destination.disabled)
            onMove({ slot: destination.slot, beforeBlockId: destination.beforeBlockId });
        }}
      >
        <label htmlFor="canvas-destination">Нове місце на сторінці</label>
        <select id="canvas-destination" value={choice} onChange={(e) => choose(e.target.value)}>
          <option value="">Оберіть позицію</option>
          {options.map((group) => (
            <optgroup key={group.slot.id} label={placementLabel(group.slot.id, group.slot.label)}>
              {group.positions.map((o) => (
                <option key={o.key} value={o.key} disabled={o.disabled}>
                  {placementLabel(group.slot.id, group.slot.label)}
                  {o.label && ' · ' + o.label}
                  {o.disabled ? ' (поточне місце)' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div>
          <Button type="submit" disabled={!destination || destination.disabled}>
            Перемістити
          </Button>
          <Button className="button button-secondary" onClick={() => dialog.current?.close()}>
            Скасувати
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
