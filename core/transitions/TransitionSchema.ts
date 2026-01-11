// core/transitions/TransitionSchema.ts

export type TransitionProperty =
  | "x"
  | "y"
  | "opacity"
  | "scale"
  | "rotation"
  | "width"
  | "height";

export type TransitionDefinition = {
  id: string;

  // State relationship
  fromStateId: string;
  toStateId: string;

  // What changes
  properties: TransitionProperty[];

  // How it changes
  durationMs: number;
  easing: "linear" | "easeIn" | "easeOut" | "easeInOut";

  // Optional constraints
  delayMs?: number;
};
