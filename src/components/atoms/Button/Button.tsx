import type { ButtonProps } from './types';

export function Button({ type = 'button', className = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={className} />;
}
