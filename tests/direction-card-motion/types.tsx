export type MotionCard = {
  active: boolean;
  toggleAttribute: (name: string, active: boolean) => void;
  removeAttribute: (name: string) => void;
};
export type MotionEntries = { target: MotionCard; isIntersecting: boolean }[];
export type MotionObserverCallback = (entries: MotionEntries) => void;
