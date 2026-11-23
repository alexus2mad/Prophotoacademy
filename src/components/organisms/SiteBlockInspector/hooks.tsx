import { useState } from 'react';
import {
  addBlockItem,
  createBlock,
  duplicateBlock,
  itemFieldId,
  moveBlockItem,
  removeBlockItem,
} from '@/lib/site-editor/blocks';
import type { BlockType, SiteSection } from '@/lib/site-editor/types';
import type { CompositionControls } from './types';

export function useBlockComposition({
  page,
  sectionId,
  disabled,
  onChange,
  onSelect,
  onMessage,
}: CompositionControls) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const section = page?.sections.find((entry) => entry.id === sectionId);
  function insert(sectionToAdd: SiteSection) {
    if (!page || disabled) return;
    const index = section?.blockType ? page.sections.indexOf(section) + 1 : page.sections.length;
    const sections = [...page.sections];
    sections.splice(index, 0, sectionToAdd);
    onChange({ ...page, sections });
    setLibraryOpen(false);
    onSelect(sectionToAdd.id, sectionToAdd.fields[0]?.id, true);
  }
  function addBlock(type: BlockType) {
    insert(createBlock(type));
    onMessage('Блок додано до чернетки');
  }
  function copyBlock() {
    if (!section?.blockType || disabled) return;
    insert(duplicateBlock(section));
    onMessage('Копію блоку додано');
  }
  function moveBlock(direction: -1 | 1) {
    if (!page || !section?.blockType || disabled) return;
    const sections = [...page.sections];
    const current = sections.indexOf(section);
    const destination = current + direction;
    if (!sections[destination]?.blockType) return;
    [sections[current], sections[destination]] = [sections[destination], section];
    onChange({ ...page, sections });
    onMessage(`Блок переміщено ${direction === -1 ? 'вище' : 'нижче'}`);
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
    const sections = page.sections.filter((entry) => entry.id !== section.id);
    const next = sections[Math.min(page.sections.indexOf(section), sections.length - 1)];
    onChange({ ...page, sections });
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
    if (!section?.itemIds || disabled) return;
    const next = addBlockItem(section);
    const added = next.itemIds?.at(-1);
    if (!added || next === section) return;
    replace(next);
    onSelect(next.id, itemFieldId(added, next.blockType === 'cards' ? 'title' : 'image'), true);
    onMessage(next.blockType === 'cards' ? 'Картку додано' : 'Слайд додано');
  }
  function deleteItem(id: string) {
    if (!section?.itemIds || disabled) return;
    const isCards = section.blockType === 'cards';
    if (
      !window.confirm(
        isCards ? 'Видалити цю картку з чернетки?' : 'Видалити цей слайд із чернетки?',
      )
    )
      return;
    const next = removeBlockItem(section, id);
    replace(next);
    const remaining =
      next.itemIds?.[Math.min(section.itemIds.indexOf(id), (next.itemIds?.length ?? 0) - 1)];
    onSelect(
      section.id,
      remaining ? itemFieldId(remaining, isCards ? 'title' : 'image') : 'heading',
      true,
    );
    onMessage(isCards ? 'Картку видалено' : 'Слайд видалено');
  }
  function moveItem(id: string, direction: -1 | 1) {
    if (!section || disabled) return;
    const next = moveBlockItem(section, id, direction);
    if (next === section) return;
    replace(next);
    onSelect(section.id, itemFieldId(id, section.blockType === 'cards' ? 'title' : 'image'));
    onMessage('Порядок елементів змінено');
  }
  return {
    libraryOpen,
    setLibraryOpen,
    addBlock,
    copyBlock,
    moveBlock,
    deleteBlock,
    addItem,
    deleteItem,
    moveItem,
  };
}
