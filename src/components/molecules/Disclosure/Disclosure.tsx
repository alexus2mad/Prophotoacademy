import type { DisclosureProps } from './types';

export function Disclosure({ title, children, open }: DisclosureProps) {
  return (
    <details open={open}>
      <summary>{title}</summary>
      {children}
    </details>
  );
}
