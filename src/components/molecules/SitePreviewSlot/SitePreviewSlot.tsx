import { Fragment } from 'react';
import { GripVertical } from 'lucide-react';
import { SiteInsertionPoint } from '@/components/atoms/SiteInsertionPoint/SiteInsertionPoint';
import { MarketingBlock } from '@/components/molecules/MarketingBlock/MarketingBlock';
import { blockOutlineLabel, placementLabel } from '@/lib/site-editor/block-label';
import type { SitePreviewSlotProps } from './types';

export function SitePreviewSlot({
  slot,
  label,
  blocks,
  ticket,
  ticketAnnounced,
  editable,
  selected,
  onInsert,
  onChooseMove,
}: SitePreviewSlotProps) {
  function boundary(index: number) {
    const next = blocks[index];
    const location =
      placementLabel(slot, label) +
      (next ? ' · перед блоком «' + blockOutlineLabel(next) + '»' : '');
    const position = { slot, beforeBlockId: next?.id };
    return (
      <SiteInsertionPoint
        position={position}
        label={location}
        onChoose={() => onInsert(position, location)}
      />
    );
  }
  return (
    <>
      {blocks.map((section, i) => (
        <Fragment key={section.id}>
          {editable && boundary(i)}
          {editable && (
            <div
              data-canvas-block-bar={section.id}
              data-canvas-selected={section.id === selected || undefined}
            >
              <span>{blockOutlineLabel(section)}</span>
              <button
                type="button"
                data-canvas-grip={section.id}
                aria-label={'Перемістити блок «' + blockOutlineLabel(section) + '»'}
                aria-haspopup="dialog"
                title="Перетягніть блок або натисніть, щоб обрати місце"
                onClick={() => onChooseMove(section.id)}
              >
                <GripVertical size={18} aria-hidden="true" /> Перемістити
              </button>
            </div>
          )}
          <MarketingBlock
            section={section}
            editing={editable}
            ticket={ticket}
            ticketAnnounced={ticketAnnounced}
            preview
          />
        </Fragment>
      ))}
      {editable && boundary(blocks.length)}
    </>
  );
}
