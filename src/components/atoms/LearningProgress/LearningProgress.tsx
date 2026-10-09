import type { LearningProgressProps } from './types';
export function LearningProgress({ value, label, compact = false }: LearningProgressProps) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={'learning-progress' + (compact ? ' is-compact' : '')}>
      <div>
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <progress max={100} value={percent} aria-label={label} />
    </div>
  );
}
