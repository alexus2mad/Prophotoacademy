export type SiteBlockActionsProps = {
  label: string;
  disabled: boolean;
  first: boolean;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
  onDuplicate?: () => void;
  onRemove: () => void;
};
