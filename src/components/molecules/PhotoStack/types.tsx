import type { ImageAsset } from '@/lib/content/types';
export type StackPointer = { x: number; y: number };
export type PhotoStackProps = { images: ImageAsset[]; label: string; sizes: string };
