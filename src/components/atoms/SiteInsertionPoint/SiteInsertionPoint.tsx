import { Plus } from 'lucide-react';
import { useInsertionTap } from './hooks';
import type { SiteInsertionPointProps } from './types';
export function SiteInsertionPoint({ position, label, onChoose }: SiteInsertionPointProps) {
  const actions = useInsertionTap(onChoose);
  return (
    <button
      type="button"
      data-canvas-boundary={position.slot}
      data-canvas-before={position.beforeBlockId}
      aria-label={'Додати блок · ' + label}
      title={'Додати блок · ' + label}
      {...actions}
    >
      <span data-canvas-line="" />
      <span data-canvas-insert-icon="">
        <Plus size={15} aria-hidden="true" />
      </span>
      <span data-canvas-line="" />
    </button>
  );
}
