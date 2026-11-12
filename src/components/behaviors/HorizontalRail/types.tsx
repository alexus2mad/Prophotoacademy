export type HorizontalRailDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  dragging: boolean;
  lastX: number;
  lastTime: number;
  velocity: number;
};

export type HorizontalRailOptions = {
  inertia?: boolean;
};

export type HorizontalRailController = {
  destroy: VoidFunction;
  cancelMomentum: VoidFunction;
};
