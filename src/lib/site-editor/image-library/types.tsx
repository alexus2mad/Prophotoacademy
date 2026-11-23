export type LibraryImage = { url: string; name: string; context: string };
export type ImageSource = 'all' | 'academy' | 'uploads';
export type ImageLibraryResult = { images: LibraryImage[]; total: number; next: number | null };
export type ImageLibraryFilter = { query: string; offset: number; source: ImageSource };
export type SanityLibraryAsset = {
  url: string;
  originalFilename?: string;
  metadata?: { dimensions?: { width: number; height: number } };
};
export type SanityLibraryResult = { total: number; assets: SanityLibraryAsset[] };
