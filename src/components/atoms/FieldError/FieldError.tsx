import type { FieldErrorProps } from './types';

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="form-error" role="alert">
      {message}
    </p>
  );
}
