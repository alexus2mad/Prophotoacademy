import type { ButtonProps } from '@/components/atoms/Button/types';

export type IconButtonProps = Omit<ButtonProps, 'aria-label'> & { 'aria-label': string };
