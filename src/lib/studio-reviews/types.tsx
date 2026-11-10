export type StudioReview = {
  id: string;
  name: string;
  title: string;
  quote: string;
  kind: 'quote' | 'story';
  sourceUrl: string;
};
