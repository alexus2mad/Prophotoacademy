export type SocialMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
};

export type SocialImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  sha256: string;
  bytes: number;
};

export type SocialImageEntry = {
  title: string;
  description: string;
  images: SocialImage[];
};
