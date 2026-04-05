import { evaluateTimeline } from './evaluateTimeline.js';

/**
 * Pure evaluation of animation timeline at time t.
 *
 * Returns a projection:
 * {
 *   nodes: {
 *     [nodeId]: { prop: value }
 *   }
 * }
 */
export function evaluateAnimationTimeline(args) {
  return evaluateTimeline(args);
}
