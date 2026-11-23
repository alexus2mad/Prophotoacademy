import { describe, expect, it } from 'vitest';
import { addBlockAt, getBlockSlot, moveBlockTo } from '@/lib/site-editor/block-position';
import { createBlock } from '@/lib/site-editor/blocks';
import { newSitePage } from '@/lib/site-editor/fields';
import { blocksAtPlacement, pagePlacements } from '@/lib/site-editor/placements';
import type { SitePage } from '@/lib/site-editor/types';
import { validateEdit } from '@/lib/site-editor/validation';

const landing = () => newSitePage('/svitlo', 'Світло', 'landing');
const firstSlot = (page: SitePage) => pagePlacements(page).find((p) => p.id !== 'end')!.id;
const idsAt = (page: SitePage, slot: string) => blocksAtPlacement(page, slot).map((s) => s.id);

describe('visual block positions', () => {
  it('inserts before a sibling and moves the same collection between locations without changing its item data', () => {
    const baseline = landing();
    const slot = firstSlot(baseline);
    const group = createBlock('cards');
    const heading = createBlock('heading');
    const withGroup = addBlockAt(baseline, group, { slot });
    const withHeading = addBlockAt(withGroup, heading, { slot, beforeBlockId: group.id });
    expect(idsAt(withHeading, slot)).toEqual([heading.id, group.id]);
    const atEnd = moveBlockTo(withHeading, group.id, { slot: 'end' });
    expect(idsAt(atEnd, slot)).toEqual([heading.id]);
    expect(idsAt(atEnd, 'end')).toEqual([group.id]);
    const moveBack = moveBlockTo(atEnd, group.id, { slot, beforeBlockId: heading.id });
    expect(idsAt(moveBack, slot)).toEqual([group.id, heading.id]);
    const savedGroup = moveBack.sections.find((s) => s.id === group.id)!;
    expect(savedGroup.fields).toBe(group.fields);
    expect(savedGroup.itemIds).toBe(group.itemIds);
    expect(moveBack.sections.filter((s) => !s.blockType)).toEqual(baseline.sections);
    expect(validateEdit(moveBack, baseline, false, false)).toEqual(moveBack);
    expect(baseline.sections.some((s) => s.blockType)).toBe(false);
  });

  it('keeps legacy placement and ignores self drops, stale neighbors, wrong slots and moves of native sections', () => {
    const page = landing();
    const first = createBlock('paragraph'),
      second = createBlock('image');
    page.sections.push(first, second);
    const slot = firstSlot(page);
    expect(getBlockSlot(first)).toBe('end');
    expect(idsAt(page, 'end')).toEqual([first.id, second.id]);
    for (const position of [
      { slot: 'end', beforeBlockId: first.id },
      { slot: 'end', beforeBlockId: second.id },
      { slot, beforeBlockId: second.id },
      { slot, beforeBlockId: 'deleted' },
      { slot: 'not-a-location' },
    ]) {
      expect(moveBlockTo(page, first.id, position)).toBe(page);
    }
    expect(moveBlockTo(page, second.id, { slot: 'end' })).toBe(page);
    expect(moveBlockTo(page, page.sections[0].id, { slot })).toBe(page);
    expect(addBlockAt(page, first, { slot })).toBe(page);
    expect(addBlockAt(page, page.sections[0], { slot })).toBe(page);
  });

  it('rejects fabricated placements and native placement metadata and strips a forged preview marker', () => {
    const base = landing();
    const block = createBlock('paragraph');
    const misplaced = {
      ...base,
      sections: [...base.sections, { ...block, placement: 'checkout-arbitrary' }],
    };
    expect(() => validateEdit(misplaced, base, false, false)).toThrow(/місце/);
    const changed = structuredClone(base);
    changed.sections[0].placement = 'end';
    expect(() => validateEdit(changed, base, false, false)).toThrow();
    expect(validateEdit({ ...base, editorPreview: true }, base, false, false)).not.toHaveProperty(
      'editorPreview',
    );
  });
});
