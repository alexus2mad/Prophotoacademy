import type { EcosystemWordmarkProps } from './types';
export function EcosystemWordmark({ name }: EcosystemWordmarkProps) {
  return (
    <span className="ecosystem-wordmark">
      <strong>PROPHOTO</strong>
      <span>{name}</span>
    </span>
  );
}
