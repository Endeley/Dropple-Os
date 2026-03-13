import { isAutoLayoutChild } from '@/runtime/layout/isAutoLayoutChild.js';

export function computeIsAutoLayoutChild(node, nodesById) {
  return isAutoLayoutChild(node, nodesById);
}
