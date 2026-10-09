export type MotionEntry = {
  image: HTMLImageElement;
  pointer: { x: number; y: number } | null;
  cleanup: () => void;
};
