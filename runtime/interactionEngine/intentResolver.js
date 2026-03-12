import { INTERACTIONS } from './interactionRegistry.js';

export function resolveIntent(input = {}, context = {}) {
  const tool = input.tool ?? context.tool ?? null;

  if (tool === 'move') return INTERACTIONS.MOVE;
  if (tool === 'resize') return INTERACTIONS.RESIZE;
  if (tool === 'rotate') return INTERACTIONS.ROTATE;
  if (tool === 'pan') return INTERACTIONS.PAN;
  if (tool === 'zoom') return INTERACTIONS.ZOOM;
  if (tool === 'marquee') return INTERACTIONS.MARQUEE;

  return null;
}
