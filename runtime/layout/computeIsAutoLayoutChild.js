import { isAutoLayoutChild } from '../../engine/layout/isAutoLayoutChild.js';

export function computeIsAutoLayoutChild(node, nodesById) {
  return isAutoLayoutChild(node, nodesById);
}
