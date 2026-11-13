import type { RefObject } from 'react';

export type GalleryImage = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type GalleryDirection = -1 | 1;

export type ImageGalleryDialogProps = {
  images: GalleryImage[];
  index: number;
  dialogRef: RefObject<HTMLDialogElement | null>;
  onNavigate: (direction: GalleryDirection) => void;
  label?: string;
};

export type GallerySwipe = {
  pointerId: number;
  x: number;
  y: number;
};
