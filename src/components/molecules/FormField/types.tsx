import type { InputHTMLAttributes } from 'react';
export type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;
