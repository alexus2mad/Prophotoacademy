export type StudioHomeCarouselProps = {
  count: number;
  active: number;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onSelect: (index: number) => void;
  label: string;
  className?: string;
};
