export type SocialPhoto = {
  src: string;
  alt: string;
  position?: string;
  squarePosition?: string;
};

export type SocialCard = {
  path: string;
  title: string;
  lines: string[];
  description: string;
  label?: string;
  subtitle: string;
  photos: SocialPhoto[];
  brand?: 'academy' | 'hub' | 'shop';
};

export type TextStyle = {
  size: number;
  color: string;
  font: 'heading' | 'body';
  maxWidth?: number;
};

export type ArtworkLayer = {
  input: Buffer;
  width: number;
  height: number;
  left: number;
  top: number;
};
