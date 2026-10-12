import type { CSSProperties } from 'react';
export type ImageZoomProps = {
  src: string;
  alt: string;
  onError: () => void;
  onNavigate: (direction: number) => void;
};
export type ImageSize = { width: number; height: number };
export type ImageTransform = { scale: number; x: number; y: number };
export type ImagePoint = { x: number; y: number };
export type ImageGesture = {
  origin: ImagePoint;
  last: ImagePoint;
  distance: number;
  pinched: boolean;
};
export type ImageZoomStyle = CSSProperties & {
  '--image-scale': number;
  '--image-x': string;
  '--image-y': string;
};
