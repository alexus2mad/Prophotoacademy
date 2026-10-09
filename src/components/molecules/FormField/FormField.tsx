import { FieldError } from '@/components/atoms/FieldError/FieldError';
import { Input } from '@/components/atoms/Input/Input';
import type { FormFieldProps } from './types';
export function FormField({ id, label, error, ...input }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <Input {...input} id={id} error={error} />
      <FieldError id={id} message={error} />
    </div>
  );
}
