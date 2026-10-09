import type { InputProps } from './types';

export function Input({ id, error, ...props }: InputProps) {
  return (
    <input
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
    />
  );
}
