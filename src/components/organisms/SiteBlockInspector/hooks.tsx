import { useState } from 'react';
import {
  addBlockItem,
  createBlock,
  duplicateBlock,
  itemFieldId,
  moveBlockItem,
  removeBlockItem,
} from '@/lib/site-editor/blocks';
import type { BlockPosition, BlockType, SiteSection } from '@/lib/site-editor/types';
import { addBlockAt, getBlockSlot, moveBlockTo } from '@/lib/site-editor/block-position';
import { blocksAtPlacement, pagePlacements } from '@/lib/site-editor/placements';
import { blockOutlineLabel } from '@/lib/site-editor/block-label';
import { collectionControls } from './collections';
import type { CompositionControls, PendingBlockInsertion } from './types';

export function useBlockComposition({
  page,
  sectionId,
  disabled,
  onChange,
  onSelect,
  onMessage,
}: CompositionControls) {
  const [insertion, setInsertion] = useState<PendingBlockInsertion | null>(null);
  const [focusNewBlock, setFocusNewBlock] = useState('');
  const section = page?.sections.find((entry) => entry.id === sectionId);
  const collection = collectionControls(section?.blockType);
  const siblings = page && section?.blockType ? blocksAtPlacement(page, getBlockSlot(section)) : [];
  const index = siblings.findIndex((s) => s.id === sectionId);
  const afterSelected: BlockPosition = section?.blockType
    ? { slot: getBlockSlot(section), beforeBlockId: siblings[index + 1]?.id }
    : { slot: 'end' };
  function openLibrary(position?: BlockPosition, label?: string) {
    if (!page || disabled) return;
    setInsertion({
      position: position ?? afterSelected,
      label:
        label ??
        (section?.blockType
          ? 'Після блоку «' + blockOutlineLabel(section) + '»'
          : 'Наприкінці сторінки'),
      canvas: !!position,
    });
  }
  function insert(sectionToAdd: SiteSection, position: BlockPosition, canvas = false) {
    if (!page || disabled) return false;
    const updated = addBlockAt(page, sectionToAdd, position);
    if (updated === page) return false;
    onChange(updated);
    setInsertion(null);
    onSelect(sectionToAdd.id, sectionToAdd.fields[0]?.id, !canvas);
    if (canvas) setFocusNewBlock(sectionToAdd.id);
    return true;
  }
  function addBlock(type: BlockType) {
    if (insertion && insert(createBlock(type), insertion.position, insertion.canvas))
      onMessage('Блок додано до чернетки');
  }
  function copyBlock() {
    if (!section?.blockType || disabled) return;
    if (insert(duplicateBlock(section), afterSelected)) onMessage('Копію блоку додано');
  }
  function moveTo(id: string, position: BlockPosition) {
    if (!page || disabled) return;
    const updated = moveBlockTo(page, id, position);
    if (updated === page) return;
    onChange(updated);
    onSelect(id);
    onMessage('Блок переміщено');
  }
  function moveBlock(direction: -1 | 1) {
    if (!section?.blockType || !siblings[index + direction]) return;
    moveTo(section.id, {
      slot: getBlockSlot(section),
      beforeBlockId: siblings[direction === -1 ? index - 1 : index + 2]?.id,
    });
  }
  function deleteBlock() {
    if (
      !page ||
      !section ||
      disabled ||
      (!section.blockType && !section.id.startsWith('landing-body-'))
    )
      return;
    if (!window.confirm(`Видалити «${section.label}» із чернетки?`)) return;
    const nextPage = {
      ...page,
      sections: page.sections.filter((entry) => entry.id !== section.id),
    };
    const slots = new Set(pagePlacements(nextPage).map((s) => s.id));
    nextPage.sections = nextPage.sections.map((s) =>
      s.blockType && !slots.has(getBlockSlot(s)) ? { ...s, placement: 'end' } : s,
    );
    const next =
      nextPage.sections[Math.min(page.sections.indexOf(section), nextPage.sections.length - 1)];
    onChange(nextPage);
    if (next) onSelect(next.id, next.fields[0]?.id, true);
    onMessage('Блок видалено з чернетки');
  }
  function replace(next: SiteSection) {
    if (page && !disabled)
      onChange({
        ...page,
        sections: page.sections.map((entry) => (entry.id === next.id ? next : entry)),
      });
  }
  function addItem() {
    if (!section?.itemIds || !collection || disabled) return;
    const next = addBlockItem(section);
    const added = next.itemIds?.at(-1);
    if (!added || next === section) return;
    replace(next);
    onSelect(next.id, itemFieldId(added, collection.target), true);
    onMessage('Додано ' + collection.object);
  }
  function deleteItem(id: string) {
    if (!section?.itemIds || !collection || disabled) return;
    if (!window.confirm('Видалити ' + collection.object + ' з чернетки?')) return;
    const next = removeBlockItem(section, id);
    replace(next);
    const remaining =
      next.itemIds?.[Math.min(section.itemIds.indexOf(id), (next.itemIds?.length ?? 0) - 1)];
    onSelect(section.id, remaining ? itemFieldId(remaining, collection.target) : 'heading', true);
    onMessage('Видалено ' + collection.object);
  }
  function moveItem(id: string, direction: -1 | 1) {
    if (!section || !collection || disabled) return;
    const next = moveBlockItem(section, id, direction);
    if (next === section) return;
    replace(next);
    onSelect(section.id, itemFieldId(id, collection.target));
    onMessage('Порядок елементів змінено');
  }
  return {
    insertion,
    openLibrary,
    closeLibrary: () => setInsertion(null),
    focusNewBlock,
    moveTo,
    first: index <= 0,
    last: index >= siblings.length - 1,
    addBlock,
    copyBlock,
    moveBlock,
    deleteBlock,
    addItem,
    deleteItem,
    moveItem,
  };
}
