export type SocialPhoto = {
  src: string;
  alt: string;
  position?: string;
  squarePosition?: string;
  squareFit?: 'contain';
};

export type SocialCard = {
  path: string;
  title: string;
  lines: string[];
  description: string;
  label: string;
  subtitle: string;
  style: 'feature' | 'split' | 'gallery' | 'identity';
  photos: SocialPhoto[];
  brand?: 'academy' | 'hub' | 'shop';
};

export type TextStyle = {
  size: number;
  color: string;
  font: 'heading' | 'body';
  maxWidth?: number;
};
