export const INTERACTIONS = {
  MOVE: 'move',
  RESIZE: 'resize',
  ROTATE: 'rotate',
  PAN: 'pan',
  ZOOM: 'zoom',
  MARQUEE: 'marquee',
};

export const interactionRegistry = new Map();

export function registerInteraction(type, factory) {
  interactionRegistry.set(type, factory);
}

export function getInteraction(type) {
  return interactionRegistry.get(type);
}
