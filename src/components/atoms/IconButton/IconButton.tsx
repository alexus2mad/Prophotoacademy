import { Button } from '@/components/atoms/Button/Button';
import type { IconButtonProps } from './types';

export function IconButton({ className = '', ...props }: IconButtonProps) {
  return <Button {...props} className={`icon-button ${className}`.trim()} />;
}
