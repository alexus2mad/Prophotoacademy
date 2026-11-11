export type CardMotionProps = {
  mode?: 'legacy' | 'studio';
};

export type CardBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type CardViewport = { width: number; height: number };

export type CardClip = { bounds: CardBounds; horizontal: boolean; vertical: boolean };

export type CardAncestorGeometry = { clip: CardClip | null; rail: HTMLElement | null };

export type CardInput = 'mouse' | 'touch' | 'keyboard' | null;
export type CardPointerPosition = { x: number; y: number };
