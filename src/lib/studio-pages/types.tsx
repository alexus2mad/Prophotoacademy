export type StudioPoint = { title: string; text: string };
export type StudioIntensiveBlock = { title: string; duration: string; paragraphs: string[] };
export type StudioIntensivePrice = {
  id: string;
  label: string;
  price: number;
  purchaseUrl?: string;
  status?: string;
};
